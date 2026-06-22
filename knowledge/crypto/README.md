# Crypto

This section focuses on **practical cryptography for hacking/CTFs**: how to quickly recognize common patterns, pick the right tools, and apply known attacks.

If you're here for hiding data inside files, go to the **Stego** section.

## How to use this section

Crypto challenges reward speed: classify the primitive, identify what you control (oracle/leak/nonce reuse), then apply a known attack template.

### CTF workflow
> Related: [ctf-workflow/README.md](ctf-workflow/README.md)

### Symmetric crypto
> Related: [symmetric/README.md](symmetric/README.md)

### Hashes, MACs, and KDFs
> Related: [hashes/README.md](hashes/README.md)

### Public-key crypto
> Related: [public-key/README.md](public-key/README.md)

### TLS and certificates
> Related: [tls-and-certificates/README.md](tls-and-certificates/README.md)

### Crypto in malware
> Related: [crypto-in-malware/README.md](crypto-in-malware/README.md)

### Misc
> Related: [ctf-misc/README.md](ctf-misc/README.md)

## Quick setup

- Python: `python3 -m venv .venv && source .venv/bin/activate`
- Libraries: `pip install pycryptodome gmpy2 sympy pwntools`
- SageMath (often essential for lattice/RSA/ECC): https://www.sagemath.org/
