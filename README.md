<img width="2190" height="744" alt="Screenshot 2025-11-18 at 9 28 23 PM (1)" src="https://github.com/user-attachments/assets/8f85fa55-11cf-479d-8211-d81a592f9cb5" />

# create-liquid-apps

Scaffold Avail Nexus demo apps with framework + auth + widgets choices.

## Usage

```bash
# Using pnpm
pnpx create-liquid-apps

# Using npm
npx create-liquid-apps

# Using bun
bunx create-liquid-apps

# With options
pnpx create-liquid-apps my-app --framework next --widgets nexus-core --auth wagmi-familyconnect
```

## Development

```bash
# Install dependencies
bun install

# Run locally
bun run dev

# Build
bun run build

# Test locally
pnpm dlx ./create-liquid-apps-1.0.0.tgz
```

## Publishing

### Manual Publishing

1. **Update version** in `package.json`
2. **Build the package**:
   ```bash
   bun run build
   ```
3. **Test locally**:
   ```bash
   npm pack
   pnpx ./create-liquid-apps-1.0.0.tgz --help
   ```
4. **Login to npm** (if not already):
   ```bash
   npm login
   ```
5. **Publish**:
   ```bash
   npm publish
   ```

### Automated Publishing with GitHub Actions

This project includes a GitHub Action workflow that automatically publishes to npm when pushing to the `release` branch:

1. **Create a new release commit** with the version in the commit message:
   ```bash
   # Update your code, then commit with version in the message
   git commit -m "Release version 1.2.3"
   ```

2. **Push to the release branch**:
   ```bash
   git push origin main:release
   ```

3. The GitHub Action will:
   - Extract the version from your commit message (format: 1.2.3 or v1.2.3)
   - Update the package.json version
   - Build the package
   - Publish to npm

**Note:** You need to add an `NPM_TOKEN` secret to your GitHub repository settings. This token must have publish permissions for your npm account.

### First-time publish notes

- Make sure the package name `create-liquid-apps` is available on npm
- Update the `repository` URL in `package.json` with your actual GitHub repo
- Consider adding `--access public` if publishing to a scoped package

## How it works

- The CLI uses `#!/usr/bin/env node` shebang to be executable
- Built with Bun but targets Node.js for compatibility
- The `bin` field in `package.json` maps the command name to the executable
- The `files` field ensures only necessary files are published
- `prepublishOnly` script automatically builds before publishing

