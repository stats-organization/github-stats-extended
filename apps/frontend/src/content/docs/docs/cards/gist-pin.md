---
title: Gist Pin Card
---

GitHub gist pins allow you to pin gists in your GitHub profile using a GitHub profile readme.

## Usage

Copy-paste this code into your readme and change the links.

Endpoint: `api/gist?id=bbfce31e0217a3689c8d961a356cb10d`

```md
[![Gist Card](https://github-stats-extended.vercel.app/api/gist?id=bbfce31e0217a3689c8d961a356cb10d)](https://gist.github.com/Yizack/bbfce31e0217a3689c8d961a356cb10d/)
```

## Options

You can customize the appearance and behavior of the gist card using the [common options](/frontend/docs/customization/common-options/) and exclusive options listed in the table below.

| Name                | Description                                                                                             | Type    | Default value |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| `show_owner`        | Shows the gist's owner name.                                                                            | boolean | `false`       |
| `browser_rendering` | Compute text wrapping of gist description natively in the browser, instead of computing it server-side. | boolean | `false`       |

## Demo

![Gist Card](/api/gist?id=bbfce31e0217a3689c8d961a356cb10d)

Use [show\_owner](#options) query option to include the gist's owner username

![Gist Card](/api/gist?id=bbfce31e0217a3689c8d961a356cb10d&show_owner=true)
