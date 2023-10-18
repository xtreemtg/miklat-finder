// Still in development
function localizePage(locale="en") {
    var locale_json;

    switch(locale) {
        case "en":
            locale_json = EN_JSON;
            break;
        case "he":
            locale_json = HE_JSON;
            break;
    }

    // Get all locale elements
    const localeElements = document.querySelectorAll("[locale-value]");

    for (let i = 0; i < localeElements.length; i++) {
        const localeElement = localeElements[i];

        try {
            if (localeElement.tagName == "INPUT")
                localeElement.setAttribute("placeholder", locale_json[localeElement.getAttribute("locale-value")]);
            else {
                if (localeElement.tagName == "A")
                    localeElement.setAttribute("href", locale_json[localeElement.getAttribute("locale-value")]);

                // Handle initial element being a bold tag
                var nodeToChange = localeElement.childNodes[0];

                if (nodeToChange.tagName == "B")
                    nodeToChange = localeElement.childNodes[1];

                nodeToChange.nodeValue = locale_json[localeElement.getAttribute("locale-value")];
            }
        } catch (error) {
        }
    }
}

localizePage();
