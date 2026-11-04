---
title: A 4-digit PIN that's still hard to steal: PSKey's rolling challenge
date: 2026-11-04
summary: How PSKey keeps a tiny PIN usable without letting keystroke loggers or a stolen vault file walk away with it — Base36 challenges, a device secret mixed into Argon2id, and lockouts that survive a reboot.
tags: security, rust, tauri, cryptography
project: pskey
---

PSKey is a 145 px, always-on-top password manager widget built with Tauri, React and libsodium. Its lock screen asks for a **4-digit PIN**. That sounds like a bad idea — 10⁴ combinations is nothing — so this note walks through the three layers that make it reasonable.

## 1. You never type your PIN

The lock screen shows a 4-character Base36 challenge (`0-9A-Z`). You don't type the PIN you memorised; you type a *response* computed per slot:

```text
response[i] = base36( (pin_digit[i] + value(challenge[i])) mod 36 )
```

With PIN `1234` and challenge `7Z58`:

| slot | PIN | challenge | value | sum | mod 36 | type |
| ---- | --- | --------- | ----- | --- | ------ | ---- |
| 1    | 1   | `7`       | 7     | 8   | 8      | `8`  |
| 2    | 2   | `Z`       | 35    | 37  | 1      | `1`  |
| 3    | 3   | `5`       | 5     | 8   | 8      | `8`  |
| 4    | 4   | `8`       | 8     | 12  | 12     | `C`  |

You type `818C`. The challenge rotates every 30 seconds and after every failed attempt, so someone who only records keystrokes learns nothing they can replay.

On the Rust side, `vault_unlock_challenge` reverses the math per slot. Any decoded slot ≥ 10 can't be a real PIN digit, so it's rejected as a typo **without** consuming a lockout attempt. Otherwise it runs exactly one Argon2id derivation for the recovered PIN — no candidate enumeration.

## 2. A stolen vault file is useless on its own

The weak point of any short PIN is offline brute force: copy the encrypted file, try all 10,000 PINs. PSKey closes that by mixing a 32-byte, per-install **device secret** into every key derivation:

```text
key = Argon2id(pin || device_secret)
```

The secret lives in `device_secret.bin`, outside the vault file (mode `0600` on Unix). If `vault.bin` leaks through a cloud sync or a mis-shared backup, the attacker is guessing 10⁴ × 2²⁵⁶ inputs, not 10⁴.

The rest is deliberately boring, well-reviewed crypto: libsodium `crypto_pwhash` (Argon2id) with selectable strength — Interactive ≈ 64 MiB, Moderate ≈ 256 MiB, Sensitive ≈ 1 GiB — and XSalsa20-Poly1305 `secretbox` for the payload. Nothing hand-rolled.

## 3. The UI can't be brute-forced either

Online guessing through the widget is capped by a **persistent, escalating lockout**: 10 attempts before the first cooldown, then only 3 between each one after, with cooldowns climbing from 1 minute to a 24-hour cap. The counter is stored on disk, so killing the process or rebooting doesn't reset it.

Add a 30-second sliding session, instant lock when the window loses focus, and a clipboard that wipes itself after 15 seconds, and the "tiny PIN" is the least interesting part of the attack surface.

## What it doesn't defend against

Being explicit about this matters more than the features:

- Someone who can read **both** `vault.bin` and `device_secret.bin` has the full KDF input. Treat the device secret like an SSH private key; hardware-backed storage (Keychain, DPAPI, Secret Service) is the natural next step.
- Someone who sees the **screen and the keystrokes** at the same time can solve the challenge just like you do.
- Malware running as your user can read memory and the clipboard after unlock. PSKey is a userland tool.

## Takeaway

A short secret is fine when the system around it removes the cheap attacks: make keystrokes non-replayable, make the stored file worthless without a second factor on disk, and make online guessing slow and persistent. The [full security model is on the project page](/projects/pskey).
