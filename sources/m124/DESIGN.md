# 形与感 / Frontend Design laboratory

Subject: an interactive visual-design laboratory for the user evaluating the installed frontend-design skill. Audience: a person exploring visual and interaction choices. Primary job: see a polished complete composition, then manipulate it and understand what changes.

Palette: mineral white #f5f9f8; ice #e2efee; deep ocean #164552; tide blue #2173a6; berry #a84270; ink #183e49. The palette comes from acrylic color swatches and printed type specimens, not software-dashboard defaults.

Type: Sora for Latin wordmark and large numbers; Noto Sans SC for Chinese interface and the default specimen; Noto Serif SC as an explicitly selected specimen style. Strong contrast between expressive specimen type and restrained UI text. Left aligned captions, centered poster type, no uppercase eyebrows or decorative numbering.

Layout alternatives:
A. Repeated demo cards: rejected because it could be any effects gallery.
B. Large live specimen with a narrow tool desk, followed by different experiment formats: chosen. The specimen is the memorable focal object.

    [wordmark       experiment anchors       dark mode]
    [short introduction / description]
    [large live type poster          | controls]
    [material object     | motion rail + controls]
    [layout switch and reflowing art collection]
    [working dialog, disclosure, switches / notes]

Behavior: type, weight, tracking and palette controls update live; pointer tilt is confined to a physical card; motion runs only on replay; layout switches reflow actual content; dialog form validates locally and confirms with a toast, never submits externally. Pause disables optional movement. Reduced-motion preference respected. Mobile stacks controls with a readable specimen.

Review before build: replaced a generic grid of named effects with a specimen workbench. No colored word in the headline, no numbered section eyebrows, no constantly running background animation, no invented usage statistics. Six experiment areas represent the skill's design principles; they are not claimed as an exhaustive skill-owned component library.
