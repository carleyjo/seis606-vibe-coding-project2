# API Layer

The client uses public Wikivoyage reads over HTTPS with `origin=*`. It does not contain
an API key. Requests retain source URLs, use bounded caching, and apply throttling and
retry behavior. See `contracts/openapi.yaml` for the logical interface.
