function getLocaleJson(locale) {
    var locale_json;

    switch(locale) {
        case "en":
            locale_json = EN_JSON;
            break;
        case "he":
            locale_json = HE_JSON;
            break;
    }

    return locale_json;
}

function localizePage(locale="en") {
    const locale_json = getLocaleJson(locale);
    localStorage.setItem("locale", locale);

    // Set all locale elements
    const localeElements = document.querySelectorAll("[locale-value]");

    for (let i = 0; i < localeElements.length; i++) {
        const localeElement = localeElements[i];
        const localeValue = locale_json[localeElement.getAttribute("locale-value")];

        try {
            if (localeElement.tagName == "INPUT")
                localeElement.setAttribute("placeholder", localeValue);
            else {
                if (localeElement.tagName == "A") {
                    var mailto = localeElement.getAttribute("locale-value").includes("email") ? "mailto: " : "";

                    localeElement.setAttribute("href", mailto + localeValue);
                }

                // Handle initial element being a bold tag
                var nodeToChange = localeElement.childNodes[0];

                if (nodeToChange.tagName == "B")
                    nodeToChange = localeElement.childNodes[1];

                nodeToChange.nodeValue = localeValue;
            }
        } catch (error) {
            console.log(`Error! Could not set locale value for ${localeElement.getAttribute("locale-value")}`);
        }
    }
    const isRTL = localStorage.getItem("direction") === "rtl";

    // Adjust legend icon positions
    const legendIcons = document.getElementsByTagName("svg");

    for (let i = 0; i < legendIcons.length; i++) {
        const legendIcon = legendIcons[i];

        if (isRTL)
            legendIcon.setAttribute("viewBox", "-5 -1 24 24");
        else
            legendIcon.setAttribute("viewBox", "-20 -1 24 24");
    }

    // Set ltr/rtl for all collapsible headers
    const collapsibleHeaders = document.getElementsByClassName("collapsible");

    for (let i = 0; i < collapsibleHeaders.length; i++) {
        const header = collapsibleHeaders[i];

        if (isRTL)
            header.style.textAlign = "right";
        else
            header.style.textAlign = "left";
    }
}

function setToLTR() {
    document.getElementsByTagName("html")[0].dir = "ltr";
    localStorage.setItem("direction", "ltr");
}

function setToRTL() {
    document.getElementsByTagName("html")[0].dir = "rtl";
    localStorage.setItem("direction", "rtl");
}

localizePage(localStorage.getItem("locale"));
