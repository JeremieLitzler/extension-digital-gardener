# A very simple but flexible block-site extension for Chrome

**🚨🚨🚨 The extension is still in beta mode as long as the v1 isn't released. 🚨🚨🚨**

## Why this extension

I used to pay for [BlockSite extension](https://blocksite.co/), but somehow, I was not really using it.

It works great but I couldn't setup time range when I wanted some websites to be disabled.

It allowed time ranges applying to all blocked websites.

## How to use Website Blocker ⁉️

1. Download the source code and unzip it in your preferred location.
2. Browse to [chrome://extensions/](chrome://extensions/).
3. Activate the Developer mode at the top right of the tab.
4. Click `load unpacked` and select the directory where you unzip the source code
5. If the installation completed, click `Details` on the extension
6. Active `Pin to toolbar`
7. Start configuring the website to block

## Features ✅

A blocking entry is defined with:

- a URL chunk (ex: "youtube" or even "youtube.com")
- a start time (hour:minute)
- an end time (hour:minute)

You can have several entries with the same URL chunk but different time ranges.

You can :

- [x] Add as many websites as possible
- [x] Allow to remove a single entry
- [x] Add as many time ranges as possible per website
- [x] Block any website browsed to in the current hour and minute falls between any of the entries
- [x] Use the autocomplete when typing url chunck value
- [x] See the blocked page with a random background changes pulled [from Lorem Picsum](https://picsum.photos/).
- [x] Store entries in indexedDb
- [x] Edit each entry's start and end time
- [ ] Add tests
- [ ] Export and import configuration from a CSV file
- [ ] Export and import configuration from a JSON file
- [ ] Improve popup UI
- [ ] Warn user about overlapping time ranges for same website
- [ ] Add a Pomodoro timer to the extension
- [ ] Allow blocked websites during pomodoro short breaks
- [ ] Export and import configuration from Google Drive
- [ ] Convert to TypeScript

## Troubleshooting 🐞

If your blocked websites aren't blocked, try the following:

1. Reload the extension
2. Reinstall the extension
3. Finally, submit a bug and as many details as possible to reproduce the issue.

## Supporting this project 🙋

You can submit pull request for bugs at anytime. For new feature, please describe why you need it.

For financial support, please [use my sponsor page](https://iamjeremie.me/page/sponsor-me/?utm_source=GitHub&utm_medium=social).

## Credits

Thanks to the team at Anthropic for developping [Claude.ai](https://claude.ai?utm_source=Thank%2Dyou%2DAnthropic%2DTeam&utm_medium=social). It helped me greatly to build this!
