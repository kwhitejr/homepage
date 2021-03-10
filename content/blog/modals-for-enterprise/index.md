---
title: Modal Component for Enterprise
date: "2021-XX-XX"
description: "Build an enterprise-level production-ready modal functionality from the ground up."
status: DRAFT
tags: ["frontend", "architecture", "modal"]
---

# Modal Component
### Build an enterprise-level production-ready modal functionality from the ground up.

## Motivation
Modal is one of those components that seems fairly straightforward: hide this thing until I want to see it, then overlay it on top of the screen when I do. Basic `if`/`else` stuff.
Once you begin digging in, however, you find yourself surrounded by murky questions...
* What happens when two modals want to be open? _How do I manage state?_
* How do I ensure that the modal behavior meets accessibility requirements? _What are those requirements, anyhow?_
* How is a `modal` different from a `dialog`? Is there a difference? _But why?_

This article seeks to answer those questions and more. First, I will provide a brief overview of modals and then outline the desirable feature set and accessibility requirements. Second, I will provide an annotated sample implementation. Let's dive in!

## Modals: A Brief Overview
Before we can dive into solutioning, we need to better understand the problem space. Let's start with the basics: _what is a modal?_

### Nomenclature
To keep the subsequent discussion clear, this article uses the following defined terms:
* **Modal**: any element that applies the features and accessibility guidelines enumerated below; **in other words, "modal" describes a set of behaviors**.
* **Dialog**: an stylized implementation of Modal characterized by a visible overlay.
* **Full Screen Dialog**: an implementation of Modal characterized by no visible overlay. Sometimes referred to as a "Takeover" or "Overlay".
* **Drawer**: an implementation of Modal characterized by transitions and screen location (e.g. generally sliding in from a side).
* **Tray**: like a Drawer, but transitions in from the bottom.
* **Overlay**: any part of the screen that is not interactive when a Modal is active; commonly characterized by a faded look and deactivates the active Modal if clicked. Sometimes referred to as "Scrim" or "Background".
* **Not a modal**: tooltips, toasts, any element that does not abide by the features and accessibility guidelines enumerated below.
* **Control Node**: a node or element on the page that opens a Modal if clicked (or otherwise interacted with).

Some common examples of modal usage are (1) cookie warnings (frequently as a tray); (2) federated authentication login (usually as a dialog); (3) exit intent pop ups (hot garbage please stop).

The takeaway is that **modal describes behavior** whereas dialog, drawer, and others are **stylized implementations** of that behavior. This article references modal as a behavioral **wrapper** and dialogs (and etc.) as modal **content**.

### Features
To be honest, I do not know a "definitive feature set" reference for modals. Most developers seem to agree on the core features, maybe out of consensus or maybe out of common sense, but there is some fuzziness around the edges. This article adheres to the following feature guidelines while acknowledging your particular requirements may vary...
* The web application **must** enforce that only one modal be active at a time.
* When a modal is open, focus **must** be moved to the content of that modal. Where focus is initially placed may vary depending on the content.
* An open modal **must not** trap the user; i.e., the user must have some means by which to close the modal.
* When a modal is closed, focus **must** be returned to the control node that opened the modal; but if the control node is no longer available, then focus should return to some rational default.

### Accessibility
Modals present unique and difficult problems for accessibility. Much like the features described above, it is hard to find a definitive reference on accessibility for modal. Here is a best-effort summary:
* The control node that opens the modal **must** announce its functionality to the user (i.e., that the control will open a modal if clicked).
* The modal functionality **must** support keyboard and virtual cursors (e.g. Voice Over) users.
* Trap Focus: when a modal is open, the background document **must not** be included in the active accessibility tree. In other words, the background elements should not be included in the tab index cycle or Voice Over navigation. In other other words, accessibility devices and software must not traverse document elements outside of the open modal.
* A open modal should have an accessible name and announce itself as a `dialog`. `<div role=dialog />` and `<dialog />` are the semantic HTML tags to describe modal content (but [`<dialog />`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) [is not universally supported](https://caniuse.com/?search=dialog)).

Accessible Modal References:
* [On creating accessible modals for desktop and modal (2019)](https://www.useragentman.com/blog/2019/03/17/creating-accessible-html5-modal-dialogs-for-desktop-and-mobile/)
* [Overview of accessible modals (2018)](https://developer.paciellogroup.com/blog/2018/06/the-current-state-of-modal-dialog-accessibility/)