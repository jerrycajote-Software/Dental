# Logo Update and Dependency Audit Fix

This document serves as a record of the tasks performed to refine the application's logo styling and patch critical security vulnerabilities reported by NPM.

## 1. Logo Customization (Zoom & Circular Crop)
**The Goal:** Change the Vite project's favicon to use `dental_logo.jpg`, and then manipulate the image so it is zoomed in and cropped into a perfect circle with a transparent background.

**The Problem to Fix:**
* Standard HTML tools cannot easily perform advanced image cropping or masking (like circles) onto a JPG directly without CSS. 
* A JPG file does not natively support transparency, which is required for making the circular edges look seamless in the browser tab.

**How it was Fixed:**
1. The `dental_logo.jpg` was moved to the `public/` directory (so Vite can serve it locally).
2. A temporary Node.js script (`process_logo.js`) was created utilizing the `sharp` image manipulation package. 
3. The script loaded the image, calculated the geometric center, clipped it with an SVG circular mask slightly zoomed in (approx 70% of the bounds), and exported it as a PNG file (`dental_logo_circle.png`).
4. `index.html` was updated to reflect the new processed image.

**Commands Used:**
* `Move-Item "...\dental_logo.jpg" "...\public\dental_logo.jpg"`  
  *Purpose:* Correctly places the raw image into the `public/` directory, which Vite leverages for static asset routing (serving it dynamically at `/`).
* `npm install --no-save sharp`  
  *Purpose:* Installed the `sharp` image-processing library into the current environment without adding it to `package.json`.
* `node process_logo.js`  
  *Purpose:* Executed our custom script that processed the JPG and generated the circular PNG.

---

## 2. Resolving High-Severity NPM Vulnerabilities
**The Goal:** Clear three "High Severity" security vulnerabilities inside `serialize-javascript` affecting the client project upon running `npm audit`. 

**The Problem to Fix:**
* Attempting a standard `npm audit fix` resulted in an `ERESOLVE` error. 
* The Node package manager encountered strict version conflicts where `vite-plugin-pwa` requested an older version of `vite` alongside the dependencies pulling in the insecure version of `serialize-javascript <=7.0.4`. Because of this peer-dependency conflict, NPM flatly refused to update the tree automatically.

**How it was Fixed:**
Instead of brute-forcing an unstable upgrade, we used NPM's `overrides` feature inside `package.json`. We manually forced `serialize-javascript` to resolve to the secure patch `7.0.5`. By bypassing the legacy peer dependency check during installation, NPM was forced to adhere strictly to the override without complaining about Vite versions.

**Commands Used:**
* `npm audit fix`  
  *Purpose:* Initial attempt to patch the vulnerability. Failed, but revealed the underlying `ERESOLVE` peer dependency blockage.
* `npm ls serialize-javascript`  
  *Purpose:* Printed the dependency tree to find out *which exact library* pulled in the vulnerable code (it traced back to `vite-plugin-pwa` -> `workbox-build` -> `@rollup/plugin-terser`).
* `npm info serialize-javascript versions`  
  *Purpose:* Looked up the latest available versions on the NPM registry to determine that `7.0.5` patched the vulnerability.
* *(File Edit)*: Modified `client/package.json` to append:
  ```json
  "overrides": {
    "serialize-javascript": "7.0.5"
  }
  ```
* `npm install --legacy-peer-deps`  
  *Purpose:* Finalized the installation. Forced NPM to apply the `overrides` resolution tree while explicitly ignoring the `ERESOLVE` conflicts. This brought the vulnerability count down to zero.
