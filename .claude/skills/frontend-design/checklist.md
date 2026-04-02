# Frontend Design Checklist

Before handing off to implementation:

## Visual System
- [ ] One coherent direction chosen (theme + do/don't)
- [ ] Color usage rules defined (primary + 2-3 accents)
- [ ] Typography hierarchy defined (H1/H2/body/labels)
- [ ] Spacing + layout rhythm defined (section padding, grid gaps)

## Page Spec
- [ ] Clear section order with purpose per section
- [ ] Primary CTA defined and repeated appropriately
- [ ] Responsive behavior defined (375/768/1440)

## Components
- [ ] Reuses existing `components/ui/*` primitives where possible
- [ ] Each component has props/variants + states
- [ ] Interaction states specified (hover/focus/disabled)
- [ ] Accessibility notes included (labels, keyboard, contrast)

## Content
- [ ] Copy is consistent (tone, length, terminology)
- [ ] Empty/loading/error states have text (if relevant)

## Handoff Quality
- [ ] No ambiguity for developer (Tailwind-implementable)
- [ ] Acceptance Criteria still satisfied (or improved)

