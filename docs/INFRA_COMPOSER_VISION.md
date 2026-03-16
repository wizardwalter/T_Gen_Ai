# Infrastructure Composer Vision

## Summary
Build a second product mode separate from Terraform-upload diagramming:

- Blank canvas architecture composer
- Drag and drop AWS resource icons
- Configure each resource with type-specific settings
- Generate Terraform files and downloadable folders

This mode is intended to become the primary subscription driver.

## Product Direction

### Phase 1: Manual Composer + Terraform Output
- Left panel with AWS icons grouped by category
- Blank canvas with columns/lanes (edge, app, data, security, observability)
- Drag/drop resources onto canvas
- Click resource to open resource-specific config forms
- Connect resources to define relationships/dependencies
- Generate Terraform with loading screen and status messaging
- Output split into separate `.tf` files named by resource
- Export options:
  - copy single file
  - copy all files
  - download full folder/zip

### Phase 2: Saved Architectures
- Save projects so users can resume where they left off
- Keep architecture versions/snapshots
- Enable iterative editing and regeneration
- Use saved architectures as high-quality training data for future AI recommendations

### Phase 3: AI Reviewer / Optimizer
After user creates architecture manually:
- User clicks an AI review button
- Loading screen with assistant character (robot scientist) appears
- Assistant reviews architecture and gives actionable feedback
- Feedback categories:
  - security flaws
  - IAM over-permissioning
  - cost optimization opportunities
  - simplification recommendations
  - potential resiliency issues

### Phase 4: AI-Assisted Generation
- Recommend best-practice architectures based on accumulated manual designs
- Suggest improved topologies before Terraform generation
- Offer auto-fix proposals with accept/reject controls

## Key UX Requirements
- Composer remains visual-first, fast, and intuitive
- Resource config forms must be specific to each AWS resource type
- Terraform output must be deterministic and readable
- Recommendations must be transparent and explain why changes are suggested
- Users must be able to edit everything manually even when AI recommendations exist

## Why This Matters
- Enables direct subscription value beyond static visualization
- Creates a data flywheel from real user architecture design patterns
- Provides a path from manual IaC composition to intelligent optimization

