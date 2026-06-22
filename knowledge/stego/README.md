# Stego

This section focuses on **finding and extracting hidden data** from files (images/audio/video/documents/archives) and from text-based steganography.

If you're here for cryptographic attacks, go to the **Crypto** section.

## Entry Point

Approach steganography as a forensics problem: identify the real container, enumerate high-signal locations (metadata, appended data, embedded files), and only then apply content-level extraction techniques.

### Workflow & triage

A structured workflow that prioritizes container identification, metadata/string inspection, carving, and format-specific branching.
> Related: [workflow/README.md](workflow/README.md)

### Images

Where most CTF stego lives: LSB/bit-planes (PNG/BMP), chunk/file-format weirdness, JPEG tooling, and multi-frame GIF tricks.
> Related: [images/README.md](images/README.md)

### Audio

Spectrogram messages, sample LSB embedding, and telephone keypad tones (DTMF) are recurring patterns.
> Related: [audio/README.md](audio/README.md)

### Text

If text renders normally but behaves unexpectedly, consider Unicode homoglyphs, zero-width characters, or whitespace-based encoding.
> Related: [text/README.md](text/README.md)

### Documents

PDFs and Office files are containers first; attacks usually revolve around embedded files/streams, object/relationship graphs, and ZIP extraction.
> Related: [documents/README.md](documents/README.md)

### Malware and delivery-style steganography

Payload delivery frequently uses valid-looking files (e.g., GIF/PNG) that carry marker-delimited text payloads, rather than pixel-level hiding.
> Related: [malware-and-network/README.md](malware-and-network/README.md)
