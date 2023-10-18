// Still in development
function localizePage() {
    const localeElements = document.querySelectorAll("[locale-value]");

    for (let i = 0; i < localeElements.length; i++) {
        const localeElement = localeElements[i];

        try {
            if (localeElement.tagName == "INPUT")
                localeElement.setAttribute("placeholder", EN_JSON[localeElement.getAttribute("locale-value")]);
            else {
                if (localeElement.tagName == "A")
                    localeElement.setAttribute("href", EN_JSON[localeElement.getAttribute("locale-value")]);

                // Handle initial element being a bold tag
                var nodeToChange = localeElement.childNodes[0];

                if (nodeToChange.tagName == "B")
                    nodeToChange = localeElement.childNodes[1];

                nodeToChange.nodeValue = EN_JSON[localeElement.getAttribute("locale-value")];
            }
        } catch (error) {
        }
    }
}

localizePage();
