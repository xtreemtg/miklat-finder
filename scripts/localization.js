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
    localStorage.setItem("locale", locale);

    // Set all locale elements
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
            console.log(`Error! Could not set locale value for ${localeElement.getAttribute("locale-value")}`);
        }
    }

    // Set ltr/rtl for all collapsible headers
    const collapsibleHeaders = document.getElementsByClassName("collapsible");
    const isRTL = localStorage.getItem("direction") === "rtl";

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
