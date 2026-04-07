import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealth:
    def test_health(self):
        r = requests.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

class TestModels:
    def test_get_models(self):
        r = requests.get(f"{BASE_URL}/api/models")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 15
        m = data[0]
        assert "name" in m
        assert "provider" in m
        assert "scores" in m
        assert "id" in m

    def test_get_model_by_slug(self):
        r = requests.get(f"{BASE_URL}/api/models/o3")
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "o3"
        assert data["provider"] == "OpenAI"

    def test_model_not_found(self):
        r = requests.get(f"{BASE_URL}/api/models/nonexistent-model-xyz")
        assert r.status_code == 404

class TestBlog:
    def test_get_blog_posts(self):
        r = requests.get(f"{BASE_URL}/api/blog")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 9

    def test_get_blog_by_category(self):
        r = requests.get(f"{BASE_URL}/api/blog?category=Comparisons")
        assert r.status_code == 200
        data = r.json()
        for post in data:
            assert post["category"] == "Comparisons"

    def test_get_blog_post_by_slug(self):
        r = requests.get(f"{BASE_URL}/api/blog/deepseek-r1-vs-o3-reasoning-battle")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == "deepseek-r1-vs-o3-reasoning-battle"
        assert "content" in data

    def test_blog_post_no_content_in_list(self):
        r = requests.get(f"{BASE_URL}/api/blog")
        data = r.json()
        for post in data:
            assert "content" not in post

class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "admin@rankllms.com", "password": "Admin123!"})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data

    def test_login_invalid(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "wrong@example.com", "password": "wrong"})
        assert r.status_code == 401

    def test_me_endpoint(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "admin@rankllms.com", "password": "Admin123!"})
        token = r.json()["access_token"]
        r2 = requests.get(f"{BASE_URL}/api/auth/me",
                          headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200
        assert r2.json()["email"] == "admin@rankllms.com"

class TestAdminModels:
    @pytest.fixture
    def token(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "admin@rankllms.com", "password": "Admin123!"})
        return r.json()["access_token"]

    def test_create_model(self, token):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "name": "TEST_Model", "provider": "TestProvider", "slug": "test-model-xyz",
            "context_window": 8000, "input_cost": 1.0, "output_cost": 2.0,
            "speed": 50, "latency": 1.0, "release_date": "Jan 2026",
            "description": "Test model",
            "scores": {"coding": 70, "reasoning": 70, "math": 70, "multilingual": 70, "visual": 70, "overall": 70}
        }
        r = requests.post(f"{BASE_URL}/api/admin/models", json=payload, headers=headers)
        assert r.status_code == 201
        assert "id" in r.json()
        model_id = r.json()["id"]

        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/models/{model_id}", headers=headers)

    def test_admin_model_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/admin/models", json={"name": "test"})
        assert r.status_code == 401

class TestAdminBlog:
    @pytest.fixture
    def token(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "admin@rankllms.com", "password": "Admin123!"})
        return r.json()["access_token"]

    def test_get_admin_blog(self, token):
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/api/admin/blog", headers=headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_blog(self, token):
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "title": "TEST_Blog Post", "slug": "test-blog-post-xyz",
            "excerpt": "Test excerpt", "content": "<p>Test</p>",
            "category": "Guides", "author": "Test", "read_time": 5,
            "published_at": "2026-01-01", "is_published": False,
            "image_url": "https://example.com/img.jpg"
        }
        r = requests.post(f"{BASE_URL}/api/admin/blog", json=payload, headers=headers)
        assert r.status_code == 201
        post_id = r.json()["id"]

        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/blog/{post_id}", headers=headers)
