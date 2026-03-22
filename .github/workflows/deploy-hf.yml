name: Deploy to Hugging Face Spaces

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Push to Hugging Face Spaces
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
          HF_SPACE: ${{ vars.HF_SPACE_ID || 'CaffeinatedCoding/ReportRaahat' }}
        run: |
          # Configure git
          git config --global user.email "ci@reportraahat.app"
          git config --global user.name "ReportRaahat CI"

          # Build the authenticated URL
          HF_URL="https://oauth2:${HF_TOKEN}@huggingface.co/spaces/${HF_SPACE}"

          # Clone the HF Space repo (or create if doesn't exist)
          git clone "$HF_URL" hf-space --depth 1 || mkdir hf-space

          # Sync files to the HF Space
          rsync -av --delete \
            --exclude '.git' \
            --exclude 'node_modules' \
            --exclude '__pycache__' \
            --exclude '.next' \
            --exclude '.env' \
            --exclude 'venv' \
            --exclude 'hf-space' \
            --exclude 'tsc_errors*' \
            --exclude 'pip_output*' \
            --exclude 'build_output*' \
            --exclude 'dump.txt' \
            ./ hf-space/

          # Use the HF Spaces README (with metadata)
          cp HF_README.md hf-space/README.md

          # Push to HF
          cd hf-space
          git add -A
          git diff --cached --quiet && echo "No changes" && exit 0
          git commit -m "Deploy from GitHub: ${{ github.sha }}"
          git push "$HF_URL" main
