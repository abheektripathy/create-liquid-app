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

