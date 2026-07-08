def test_register_creates_account_and_returns_token(client):
    res = client.post(
        "/auth/register",
        json={"email": "ada@example.com", "password": "password123", "business_name": "Ada Fabrics"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["access_token"]
    assert body["user"]["email"] == "ada@example.com"
    assert body["user"]["business_name"] == "Ada Fabrics"
    assert body["user"]["business_id"].startswith("biz_")


def test_register_rejects_duplicate_email(client):
    payload = {"email": "ada@example.com", "password": "password123", "business_name": "Ada Fabrics"}
    first = client.post("/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post("/auth/register", json=payload)
    assert second.status_code == 400
    assert "already exists" in second.json()["detail"]


def test_register_rejects_short_password(client):
    res = client.post(
        "/auth/register",
        json={"email": "ada@example.com", "password": "short", "business_name": "Ada Fabrics"},
    )
    assert res.status_code == 422


def test_register_rejects_invalid_email(client):
    res = client.post(
        "/auth/register",
        json={"email": "not-an-email", "password": "password123", "business_name": "Ada Fabrics"},
    )
    assert res.status_code == 422


def test_login_with_correct_credentials_succeeds(client):
    client.post(
        "/auth/register",
        json={"email": "ada@example.com", "password": "password123", "business_name": "Ada Fabrics"},
    )
    res = client.post("/auth/login", json={"email": "ada@example.com", "password": "password123"})
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_login_with_wrong_password_is_rejected(client):
    client.post(
        "/auth/register",
        json={"email": "ada@example.com", "password": "password123", "business_name": "Ada Fabrics"},
    )
    res = client.post("/auth/login", json={"email": "ada@example.com", "password": "wrong-password"})
    assert res.status_code == 401


def test_login_with_unknown_email_is_rejected(client):
    res = client.post("/auth/login", json={"email": "nobody@example.com", "password": "password123"})
    assert res.status_code == 401
    # Same error for wrong password and unknown email — doesn't leak which emails are registered
    assert res.json()["detail"] == "Incorrect email or password."


def test_me_requires_a_valid_token(client):
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_me_rejects_garbage_token(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert res.status_code == 401


def test_me_returns_current_business_with_valid_token(client, auth_headers):
    res = client.get("/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"
