import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import (
    anthropic_request_config,
    canonicalize_record,
    create_app,
    extract_public_profile_links,
    is_valid_cnpj,
    score_company,
)


class RadarAppTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        database = Path(self.temp_dir.name) / "test-radar.db"
        self.app = create_app({"TESTING": True, "DATABASE": str(database), "REVIEW_JOBS_ASYNC": False})
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_validates_cnpj_check_digits(self):
        self.assertTrue(is_valid_cnpj("11222333000181"))
        self.assertFalse(is_valid_cnpj("11222333000182"))

    def test_fintech_company_scores_as_high_fit(self):
        score, segment, reasons = score_company(
            {
                "cnae_primary": "6619-3/99",
                "description": "Payment API and operations dashboard for business accounts.",
                "website_status": "available",
                "employee_count": 42,
                "decision_maker": "Alex Example",
            }
        )
        self.assertEqual(segment, "Fintech")
        self.assertGreaterEqual(score, 70)
        self.assertTrue(reasons)

    def test_focus_can_be_overridden_after_automatic_qualification(self):
        company = self.client.post(
            "/api/companies",
            json={
                "legal_name": "Example Other Business",
                "description": "Clínica veterinária para animais de estimação.",
            },
        ).get_json()["company"]
        self.assertEqual(company["effective_focus"], "fora_do_foco")

        response = self.client.patch(
            f"/api/companies/{company['id']}",
            json={"focus_override": "aderente"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["company"]["effective_focus"], "aderente")

        qualified = self.client.get("/api/companies?focus=aderente").get_json()["companies"]
        self.assertEqual(len(qualified), 1)
        self.assertEqual(qualified[0]["id"], company["id"])

    def test_csv_import_creates_and_scores_company(self):
        csv_content = (
            "razao_social,site,cnae_principal,cidade,uf,descricao,fonte\n"
            "Example Payments,https://example.com,6619-3/99,Sao Paulo,SP,Payment platform for business accounts,CNPJ test\n"
        )
        response = self.client.post(
            "/api/import",
            data={
                "source": "Test import",
                "file": (io.BytesIO(csv_content.encode("utf-8")), "companies.csv"),
            },
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["imported"], 1)

        companies = self.client.get("/api/companies").get_json()["companies"]
        self.assertEqual(len(companies), 1)
        self.assertEqual(companies[0]["segment"], "Fintech")

    def test_multi_csv_import_consolidates_duplicate_companies(self):
        first_csv = (
            "razao_social,cnpj,email,site,descricao\n"
            "Example Payments,11222333000181,contact@example.com,https://example.com,Payment platform\n"
        )
        second_csv = (
            "razao_social,cnpj,email,site,descricao\n"
            "Example Payments,11222333000181,contact@example.com,https://example.com,Payment platform with workflows\n"
        )
        response = self.client.post(
            "/api/import",
            data={
                "source": "Multi CSV",
                "file": [
                    (io.BytesIO(first_csv.encode("utf-8")), "first.csv"),
                    (io.BytesIO(second_csv.encode("utf-8")), "second.csv"),
                ],
            },
            content_type="multipart/form-data",
        )

        payload = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["files"], 2)
        self.assertEqual(payload["imported"], 1)
        self.assertEqual(payload["consolidated"], 1)
        self.assertEqual(len(self.client.get("/api/companies").get_json()["companies"]), 1)

    def test_cnae_export_headers_map_without_importing_partner_data(self):
        record = canonicalize_record(
            {
                "Razão": "Example Payments Ltda",
                "Fantasia": "Example Pay",
                "Telefone 1": "11999999999",
                "Texto CNAE Principal": "Outras atividades auxiliares dos serviços financeiros",
                "CNAE Principal": "6619-3/99",
                "Nome do Sócio": "This column must be ignored",
            },
            "CNAE export",
        )
        self.assertEqual(record["legal_name"], "Example Payments Ltda")
        self.assertEqual(record["trade_name"], "Example Pay")
        self.assertEqual(record["phone"], "11999999999")
        self.assertEqual(record["cnae_primary"], "6619-3/99")
        self.assertNotIn("Nome do Sócio", record)

    def test_company_list_filters_by_state(self):
        self.client.post(
            "/api/companies",
            json={"legal_name": "Example Sao Paulo", "state": "SP", "cnae_primary": "6619-3/99"},
        )
        self.client.post(
            "/api/companies",
            json={"legal_name": "Example Santa Catarina", "state": "SC", "cnae_primary": "6203-1/00"},
        )

        response = self.client.get("/api/companies?state=SC")
        companies = response.get_json()["companies"]
        self.assertEqual(len(companies), 1)
        self.assertEqual(companies[0]["state"], "SC")

    def test_claude_draft_stays_pending_for_human_review(self):
        company = self.client.post(
            "/api/companies",
            json={
                "legal_name": "Example Operations",
                "website": "https://example.com",
                "cnae_primary": "6203-1/00",
                "description": "B2B SaaS workflow platform",
            },
        ).get_json()["company"]

        with patch("app.call_claude", return_value=("A human-reviewed draft.", "test-model")):
            response = self.client.post(
                f"/api/companies/{company['id']}/drafts",
                json={"channel": "linkedin", "language": "pt-BR", "objective": "Abrir conversa."},
            )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["draft"]["status"], "pending_review")

    def test_manual_website_enrichment_updates_score(self):
        company = self.client.post(
            "/api/companies",
            json={
                "legal_name": "Example Platform",
                "website": "https://example.com",
                "cnae_primary": "6203-1/00",
                "description": "Operational software",
            },
        ).get_json()["company"]

        with patch(
            "app.fetch_public_website",
            return_value={
                "url": "https://example.com",
                "title": "Payments API",
                "description": "Financial infrastructure for businesses.",
                "excerpt": "Payments, data and workflows.",
            },
        ):
            response = self.client.post(f"/api/companies/{company['id']}/enrich")

        enriched = response.get_json()["company"]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(enriched["website_status"], "available")
        self.assertGreater(enriched["fit_score"], company["fit_score"])

    def test_site_analysis_collects_profile_links_and_report_page(self):
        company = self.client.post(
            "/api/companies",
            json={
                "legal_name": "Example Public Profiles",
                "website": "https://example.com",
                "description": "Business services platform",
            },
        ).get_json()["company"]

        with patch(
            "app.fetch_public_website",
            return_value={
                "url": "https://example.com",
                "title": "Example",
                "description": "Business services for companies.",
                "excerpt": "Public company information.",
                "social_links": {
                    "linkedin": "https://www.linkedin.com/company/example",
                    "facebook": "https://www.facebook.com/example",
                    "google_business": "https://g.page/example",
                },
            },
        ):
            response = self.client.post(f"/api/companies/{company['id']}/enrich")

        enriched = response.get_json()["company"]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(enriched["website_social_links"]["facebook"], "https://www.facebook.com/example")
        report = self.client.get(f"/companies/{company['id']}/report")
        self.assertEqual(report.status_code, 200)
        self.assertIn("Facebook", report.get_data(as_text=True))

    def test_review_job_analyzes_pending_websites(self):
        first = self.client.post(
            "/api/companies",
            json={"legal_name": "First Batch Website", "website": "https://first.example"},
        ).get_json()["company"]
        second = self.client.post(
            "/api/companies",
            json={"legal_name": "Second Batch Website", "website": "https://second.example"},
        ).get_json()["company"]

        def fetch_side_effect(url):
            if "first" in url:
                return {
                    "url": url,
                    "title": "First website",
                    "description": "A payments platform.",
                    "excerpt": "Payments for businesses.",
                    "social_links": {},
                }
            raise ValueError("Não foi possível acessar o site informado.")

        with patch("app.fetch_public_website", side_effect=fetch_side_effect):
            response = self.client.post("/api/review-jobs", json={"limit": 2})

        job = response.get_json()["job"]
        self.assertEqual(response.status_code, 202)
        self.assertEqual(job["status"], "completed")
        self.assertEqual(job["requested_count"], 2)
        self.assertEqual(job["processed_count"], 2)
        self.assertEqual(job["analyzed_count"], 1)
        self.assertEqual(job["unavailable_count"], 1)
        self.assertEqual(job["remaining_count"], 0)
        self.assertEqual(self.client.get(f"/api/companies/{first['id']}").get_json()["company"]["website_status"], "available")
        self.assertEqual(self.client.get(f"/api/companies/{second['id']}").get_json()["company"]["website_status"], "unavailable")

    def test_review_job_rejects_non_positive_size(self):
        response = self.client.post("/api/review-jobs", json={"limit": 0})
        self.assertEqual(response.status_code, 400)
        self.assertIn("maior que zero", response.get_json()["error"])

    def test_review_job_can_be_cancelled_before_worker_starts(self):
        self.client.post(
            "/api/companies",
            json={"legal_name": "Queued Review Website", "website": "https://queued.example"},
        )
        self.app.config["REVIEW_JOBS_ASYNC"] = True
        with patch("app.threading.Thread") as thread:
            response = self.client.post("/api/review-jobs", json={"limit": 800})

        job = response.get_json()["job"]
        self.assertEqual(response.status_code, 202)
        self.assertEqual(job["requested_count"], 1)
        thread.return_value.start.assert_called_once()

        cancelled = self.client.post(f"/api/review-jobs/{job['id']}/cancel")
        self.assertEqual(cancelled.status_code, 200)
        self.assertEqual(cancelled.get_json()["job"]["status"], "cancel_requested")

    def test_other_classification_explains_observed_activity(self):
        company = self.client.post(
            "/api/companies",
            json={
                "legal_name": "Example Veterinary Clinic",
                "cnae_primary": "7500100",
                "description": "Clínica veterinária para animais de estimação.",
            },
        ).get_json()["company"]

        self.assertEqual(company["segment"], "Outro")
        self.assertIn("Clínica veterinária", company["classification_detail"])

    def test_fit_analysis_is_optional_and_saved_for_review(self):
        company = self.client.post(
            "/api/companies",
            json={
                "legal_name": "Example Fit Review",
                "website": "https://example.com",
                "description": "Business services platform",
            },
        ).get_json()["company"]
        with patch(
            "app.fetch_public_website",
            return_value={
                "url": "https://example.com",
                "title": "Example",
                "description": "Business services for companies.",
                "excerpt": "Public company information.",
                "social_links": {},
            },
        ):
            self.client.post(f"/api/companies/{company['id']}/enrich")
        with patch("app.call_claude", return_value=("Classificação sugerida: Outro", "test-model")):
            response = self.client.post(f"/api/companies/{company['id']}/fit-analysis")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["company"]["ai_fit_summary"], "Classificação sugerida: Outro")

    def test_extract_public_profile_links_ignores_non_profile_urls(self):
        profiles = extract_public_profile_links(
            [
                "/contato",
                "https://www.linkedin.com/company/example",
                "https://www.instagram.com/example",
                "https://maps.app.goo.gl/example",
                "mailto:hello@example.com",
            ],
            "https://example.com",
        )

        self.assertEqual(profiles["linkedin"], "https://www.linkedin.com/company/example")
        self.assertEqual(profiles["instagram"], "https://www.instagram.com/example")
        self.assertEqual(profiles["google_business"], "https://maps.app.goo.gl/example")
        self.assertEqual(len(profiles), 3)

    def test_unavailable_website_can_be_removed_with_its_drafts(self):
        company = self.client.post(
            "/api/companies",
            json={
                "legal_name": "Unavailable Site",
                "website": "https://unavailable.example",
                "cnae_primary": "6203-1/00",
            },
        ).get_json()["company"]

        with patch("app.fetch_public_website", side_effect=ValueError("Não foi possível acessar o site informado.")):
            response = self.client.post(f"/api/companies/{company['id']}/enrich")

        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.get_json()["company"]["website_status"], "unavailable")

        with self.app.app_context():
            database = self.app.config["DATABASE"]
            import sqlite3

            connection = sqlite3.connect(database)
            connection.execute(
                """
                INSERT INTO drafts (
                    company_id, channel, language, model, prompt, content, created_at, updated_at
                ) VALUES (?, 'email', 'pt-BR', 'test-model', 'test prompt', 'test draft', 'now', 'now')
                """,
                (company["id"],),
            )
            connection.commit()
            connection.close()

        deleted = self.client.delete(f"/api/companies/{company['id']}")
        self.assertEqual(deleted.status_code, 200)
        self.assertTrue(deleted.get_json()["deleted"])
        self.assertEqual(self.client.get(f"/api/companies/{company['id']}").status_code, 404)

        with self.app.app_context():
            import sqlite3

            connection = sqlite3.connect(self.app.config["DATABASE"])
            draft_count = connection.execute("SELECT COUNT(*) FROM drafts WHERE company_id = ?", (company["id"],)).fetchone()[0]
            connection.close()
        self.assertEqual(draft_count, 0)

    def test_gateway_configuration_uses_bearer_auth_token(self):
        with patch.dict(
            "os.environ",
            {
                "ANTHROPIC_BASE_URL": "https://gateway.example",
                "ANTHROPIC_AUTH_TOKEN": "test-token",
                "ANTHROPIC_MODEL": "test-model",
            },
            clear=True,
        ):
            endpoint, headers, model = anthropic_request_config()

        self.assertEqual(endpoint, "https://gateway.example/v1/messages")
        self.assertEqual(headers["Authorization"], "Bearer test-token")
        self.assertNotIn("x-api-key", headers)
        self.assertEqual(model, "test-model")


if __name__ == "__main__":
    unittest.main()
