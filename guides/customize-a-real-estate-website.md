# Customize a real estate website with HTML, CSS and JavaScript

A property website needs more than a large house photograph. Visitors need to understand what is available, narrow the selection and contact the right person. This walkthrough uses [Nookwell](../README.md), a free MIT-licensed landing page, to explain which files to edit and which details need to agree.

[Open the working example](https://store.usmankhairdin.com/nookwell/?utm_source=github&utm_medium=referral&utm_campaign=practical_guides&utm_content=real_estate_demo)

![Nookwell property website layout](../preview.webp)

## Start with the content map

The page contains a home shortlist, neighbourhoods, an approach section, FAQs and an enquiry form. Keep these section IDs when replacing the copy: `homes`, `neighborhoods`, `approach`, `faq` and `contact`. The header and footer link to them. Renaming a heading is safe; changing an ID also requires updating the links that target it.

Edit `index.html` for visible content, `assets/css/nookwell.css` for design and `assets/js/nookwell.js` for listing details and interactions. Keep the existing asset folder beside the HTML file.

## Change a listing without breaking its detail view

Each property has several connected representations: the visible card, filter attributes, buttons that open its detail dialog, and its JavaScript detail data. Search both files for the existing property's key before editing. For the courtyard example, search for `courtyard`.

A card's `data-type` is used by the buy/rent filter. Its `data-area` must match a neighbourhood button's `data-area` value. Property-opening links use `data-property`; save buttons use `data-save`. If you replace a key, update all of those references together.

For example, the current card begins with:

```html
<article class="property-card" data-type="buy" data-area="brookside">
```

Changing its displayed address does not change the filter category. Update the relevant data attribute as well if the property moves to a different area. Check the dialog title, price, image and specifications after each change rather than assuming the card is the only source.

## Prepare photographs for the layout

Keep image dimensions on the HTML elements so the browser reserves space while images load. Replace the image's alternative text with an accurate description. A filename such as `garden-home.webp` should keep the same case in HTML and on the host.

Use a wide crop for the hero and inspect property-card crops at phone width. A good desktop photograph can hide the important part of the building in a narrow card. Retain the applicable photograph licence separately from the code licence.

## Connect the enquiry deliberately

The supplied form creates an unsent draft. Search for `hello@nookwell.example` and replace demonstration contact destinations. Changing an email address does not turn the page into a server-side form service. Decide whether you want an email-client handoff or a separately implemented submission endpoint.

Saved homes belong to the visitor's browser. They are not a shared account or a property-management database.

## Preview and upload

From the extracted repository, you can optionally run:

```sh
python -m http.server 4210 --bind 127.0.0.1
```

Open `http://127.0.0.1:4210/`. Try every buy/rent and neighbourhood combination, including an empty result. Open a listing, save it, close the dialog with Escape, then tab through the enquiry fields. Test a narrow screen and reduced motion.

Upload `index.html` and its asset folders together. No framework build is needed. Keep the included licence and third-party notices.

## When a landing page is too small

If the brief calls for a larger property presentation, compare the free page with [Veyravael Estates](https://store.usmankhairdin.com/templates/veyravael-estates/?utm_source=github&utm_medium=referral&utm_campaign=practical_guides&utm_content=real_estate_premium). It is a separate paid UKD Store template, not a Nookwell plugin or an upgrade that adds a property backend. Read the product scope and preview before choosing.

Written by the creator of Nookwell and UKD Store, Usman Khair Din.
