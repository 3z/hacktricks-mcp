# macOS Security & Privilege Escalation

## Basic MacOS

If you are not familiar with macOS, you should start learning the basics of macOS:

- Special macOS **files & permissions:**

> Related: [macos-files-folders-and-binaries/](macos-files-folders-and-binaries/)

- Common macOS **users**

> Related: [macos-users.md](macos-users.md)

- **AppleFS**

> Related: [macos-applefs.md](macos-applefs.md)

- The **architecture** of the k**ernel**

> Related: [mac-os-architecture/](mac-os-architecture/)

- Common macOS n**etwork services & protocols**

> Related: [macos-protocols.md](macos-protocols.md)

- **Opensource** macOS: [https://opensource.apple.com/](https://opensource.apple.com/)
  - To download a `tar.gz` change a URL such as [https://opensource.apple.com/**source**/dyld/](https://opensource.apple.com/source/dyld/) to [https://opensource.apple.com/**tarballs**/dyld/**dyld-852.2.tar.gz**](https://opensource.apple.com/tarballs/dyld/dyld-852.2.tar.gz)

### MacOS MDM

In companies **macOS** systems are highly probably going to be **managed with a MDM**. Therefore, from the perspective of an attacker is interesting to know **how that works**:

> Related: [../macos-red-teaming/macos-mdm/](../macos-red-teaming/macos-mdm/)

### MacOS - Inspecting, Debugging and Fuzzing

> Related: [macos-apps-inspecting-debugging-and-fuzzing/](macos-apps-inspecting-debugging-and-fuzzing/)

## MacOS Security Protections

> Related: [macos-security-protections/](macos-security-protections/)

## Attack Surface

### File Permissions

If a **process running as root writes** a file that can be controlled by a user, the user could abuse this to **escalate privileges**.\
This could occur in the following situations:

- File used was already created by a user (owned by the user)
- File used is writable by the user because of a group
- File used is inside a directory owned by the user (the user could create the file)
- File used is inside a directory owned by root but user has write access over it because of a group (the user could create the file)

Being able to **create a file** that is going to be **used by root**, allows a user to **take advantage of its content** or even create **symlinks/hardlinks** to point it to another place.

For this kind of vulnerabilities don't forget to **check vulnerable `.pkg` installers**:

> Related: [macos-files-folders-and-binaries/macos-installers-abuse.md](macos-files-folders-and-binaries/macos-installers-abuse.md)

### File Extension & URL scheme app handlers

Weird apps registered by file extensions could be abused and different applications can be register to open specific protocols

> Related: [macos-file-extension-apps.md](macos-file-extension-apps.md)

## macOS TCC / SIP Privilege Escalation

In macOS **applications and binaries can have permissions** to access folders or settings that make them more privileged than others.

Therefore, an attacker that wants to successfully compromise a macOS machine will need to **escalate its TCC privileges** (or even **bypass SIP**, depending on his needs).

These privileges are usually given in the form of **entitlements** the application is signed with, or the application might requested some accesses and after the **user approving them** they can be found in the **TCC databases**. Another way a process can obtain these privileges is by being a **child of a process** with those **privileges** as they are usually **inherited**.

Follow these links to find different was to [**escalate privileges in TCC**](macos-security-protections/macos-tcc/index.html#tcc-privesc-and-bypasses), to [**bypass TCC**](macos-security-protections/macos-tcc/macos-tcc-bypasses/index.html) and how in the past [**SIP has been bypassed**](macos-security-protections/macos-sip.md#sip-bypasses).

## macOS Traditional Privilege Escalation

Of course from a red teams perspective you should be also interested in escalating to root. Check the following post for some hints:

> Related: [macos-privilege-escalation.md](macos-privilege-escalation.md)

## macOS Compliance

- [https://github.com/usnistgov/macos_security](https://github.com/usnistgov/macos_security)

## References

- [**OS X Incident Response: Scripting and Analysis**](https://www.amazon.com/OS-Incident-Response-Scripting-Analysis-ebook/dp/B01FHOHHVS)
- [**https://taomm.org/vol1/analysis.html**](https://taomm.org/vol1/analysis.html)
- [**https://github.com/NicolasGrimonpont/Cheatsheet**](https://github.com/NicolasGrimonpont/Cheatsheet)
- [**https://assets.sentinelone.com/c/sentinal-one-mac-os-?x=FvGtLJ**](https://assets.sentinelone.com/c/sentinal-one-mac-os-?x=FvGtLJ)
- [**https://www.youtube.com/watch?v=vMGiplQtjTY**](https://www.youtube.com/watch?v=vMGiplQtjTY)
