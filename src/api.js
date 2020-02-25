// JS for page visuals and frontend-"backend"

function getE(idName) {
    return document.getElementById(idName);
}

// Return first found element in parentElement with className
function firstClass(parentElement, classPath = []) {
    classPath.forEach(function(childPath) {
        parentElement = parentElement.getElementsByClassName(childPath)[0];
    });
    return parentElement;
}

window.onload=function() {

    // General divs
    const userInput = getE("searchBox"),
        topBall = getE("topBall"),
        pokemon = getE("pokemon"), // Pokemon img
        hintText = getE("hintText"),
        qMarksLeft = getE("questionMarks1"),
        qMarksRight = getE("questionMarks2"),
        cloudsContainerDiv = getE("clouds"); // Cloud effect container

    let pokeData, // JSON Data
        openSearch = false, // Prevent enter key after searching when ball was open (prevent multiple enter hits)
        isBallOpen = false, // Ball control
        isBallMoving = false;

    // Dynamic CSS vars
    const cloudCSS = document.createElement("style");
    const questionCSS = document.createElement("style");
    const animationCSS = document.createElement("style");
    document.head.appendChild(cloudCSS);
    document.head.appendChild(questionCSS);
    document.head.appendChild(animationCSS);

    let pokemonStats = [
        "infoName",
        "infoWeight",
        "infoHeight",
    ];

    // Pokemon stat object table
    function createStats(nameID = []) {

        let statData = [];
        nameID.forEach(function(statName, index) {

            let statNode = document.getElementById(statName);
            statData[statName] = {
                "Ball" : firstClass(statNode, ["infoPokeball"]),
                "Bar" : firstClass(statNode, ["infoContainer"]),
                "Data" : firstClass(statNode, ["infoContainer", "infoData"]),
                "Delay" : index * .15,
            };
        });

        return statData;
    }
    pokemonStats = createStats(pokemonStats);

    // XMLHttp vars
    let pokeAPI = new XMLHttpRequest();
    pokeAPI.timeout = 10000;
    pokeAPI.responseType = "json";

    // XMLHttp funcs
    pokeAPI.onload = function() {

        if (pokeAPI.response === null) {
            pokeError("That's an imaginary Pokémon....");
        } else {
            pokeData = pokeAPI.response;
            writeHint("Here are your results....");
            let pokeImg = pokeData.sprites || [];
            pokeImg.front_default = pokeImg.front_default || "../resources/pokeWhat.png";
            openBall(pokeImg.front_default);
        }
    };
    pokeAPI.onerror = function() {
        pokeError("That didn't work. Try something else....");
    };
    pokeAPI.ontimeout = function() {
        pokeError("No one answered the door to your search request....");
    };

    // Remove dynamic CSS
    function removeCSS(customCSS) {
        while (customCSS.sheet.cssRules[0]) {
            customCSS.sheet.deleteRule(0);
        }
    }

    // Add dynamic css
    function createCSS(customCSS, selector, rules, selectorType = "") {

        // Single string rule
        let cssRule = "";
        rules.forEach(function(rule) {cssRule += rule;});

        let newRule = selectorType + selector + "{" + cssRule + "}";

        customCSS.sheet.insertRule(newRule, customCSS.sheet.cssRules.length);
    }

    // Generate random number between min and max (never actually hits max)
    function randomNum(min, max) {
        return(Math.random() * (max-min) + min);
    }

    // Generate question marks for error
    function createQuestionMarks() {

        removeQuestionMarks();

        for (let qDiv=1; qDiv < 3; qDiv++) {
            for (let i = 1; i < 6; i++) {

                let questionDiv = document.createElement("div");
                questionDiv.className = "questionMarkAnimate";
                questionDiv.id = "qm" + qDiv + "_" + i;
                questionDiv.innerText = "?";

                // Generate startX/Y endX/Y
                let startY = randomNum(35, 65),
                    endY,
                    startX,
                    endX;

                if (qDiv === 1) { // Left hand side
                    startX = randomNum(90, 100);
                    endX = randomNum(0, 20);
                } else { // Right hand side
                    startX = randomNum(0, 10);
                    endX = randomNum(70, 80);
                }

                // Generate endY
                startY < 50 ? endY = randomNum(40, 100) : endY = (randomNum(0, 60));
                let durTime = randomNum(2, i+2) + "s",
                    delayTime = randomNum(i*.1, 6) + "s";

                // Question marks animation
                let rules = [
                    "opacity: 0;",
                    "animation-iteration-count: infinite;",
                    "animation-timing-function: linear;",
                    "animation-duration: " + durTime + ";",
                    "animation-name: " + questionDiv.id + ";",
                    "animation-delay: " + delayTime + ";"
                ];
                createCSS(questionCSS, questionDiv.id, rules, "#");

                // Key frame
                rules = [
                    "0% {opacity: 0;" +
                        "top: " + startY + "%;" +
                        "left: " + startX + "%;}",
                    "10% {opacity: 1;}",
                    "60% {opacity: 1;}",
                    "70% {opacity: 0;" +
                        "top: " + endY + "%;" +
                        "left: " + endX + "%;}",
                    "100% {opacity: 0;" +
                        "top: " + endY + "%;" +
                        "left: " + endX + "%;}"
                ];
                createCSS(questionCSS, questionDiv.id, rules, "@keyframes ");

                document.getElementById("questionMarks" + qDiv).appendChild(questionDiv);
            }
        }
    }

    // Remove question marks
    function removeQuestionMarks() {
        qMarksLeft.innerHTML = "";
        qMarksRight.innerHTML = "";
        removeCSS(questionCSS);
    }

    // Create cloud effect
    function createClouds() {

        removeClouds();
        openSearch = true;

        for (let iCloud = 1; iCloud < 21; iCloud++) {

            let cloudDiv = document.createElement("div");
            cloudDiv.id = "cloud" + iCloud;

            let startY = randomNum(0, 40) - 15,
                startX = randomNum(25, 75),
                actualX = startX - 40; // Center clouds more

            // Question marks animation
            let cloudRules = [
                "opacity: 0;",
                "position: absolute;",
                "width: calc(100vh/3.5); height: calc(100vh/3.5);",
                "left: " + actualX + "%;",
                "top: " + startY + "%;",
                "animation-iteration-count: 1;",
                "animation-timing-function: linear;",
                "animation-duration: 1.5s;",
                "animation-name: " + cloudDiv.id + ";",
                "background-image: url(\"../resources/cloud" + Math.floor(randomNum(1, 5)) + ".png\");",
                "background-size: cover;"
            ];
            createCSS(cloudCSS, cloudDiv.id, cloudRules, "#");

            // Cloud swing
            let cloudSwing;
            if ((startX < 65) && (startX <= 35 || randomNum(0, 100) <= 50)) { // Swing right
                cloudSwing = "left: " + (actualX - 20) + "%;";
            } else { // Swing left
                cloudSwing = "left: " + (actualX + 20) + "%;"
            }

            // Key frame
            cloudRules = [
                "5% {opacity: 1;}",
                "70% {opacity: 0;}",
                "100% {top: " + (startY*2.5) + "%;" +
                    cloudSwing + "}"
            ];
            createCSS(cloudCSS, cloudDiv.id, cloudRules, "@keyframes ");

            cloudsContainerDiv.appendChild(cloudDiv);
        }

        setTimeout(function() {openSearch = false; cloudsContainerDiv.innerHTML = "";}, 1500);
    }

    // Remove clouds
    function removeClouds() {
        cloudsContainerDiv.innerHTML = "";
        removeCSS(cloudCSS);
    }

    // Error handler
    function pokeError(errorMsg) {
        writeHint(errorMsg);
        curIsError = true;
        pokemon.style.backgroundPosition = "center bottom";
        pokemon.style.backgroundSize = "contain";
        openBall("../resources/pokeWhat.png");
        createQuestionMarks();
    }

    // Write hint below search
    let currentlyWritingHint = false;
    function writeHint(msg = "", speed = 20, curIndex = 0) {

        currentlyWritingHint = true;

        if (curIndex === 0) {
            hintText.innerHTML = "";
        }

        if (speed === 0) {
            hintText.innerHTML = msg;
        } else {
            if (curIndex < msg.length) {
                hintText.innerHTML += msg[curIndex];
                curIndex++;
                setTimeout(function(){writeHint(msg, speed, curIndex)}, speed);
            }
        }
    }
    writeHint("Just type in a name and press enter....");

    // Start API request
    function requestPokemon() {
        let currentInput = userInput.value.trim();
        if (currentInput === "") {
            pokeError("Type in a name....");
        } else {
            pokeAPI.open("GET", "https://pokeapi.co/api/v2/pokemon/" + currentInput, true);
            pokeAPI.send();
        }
    }

    // Auto close ball timer
    let closeTime = 10;
    let curIsError = false;
    function closeTimer() {

        if (!(curIsError)) {
            resetCloseTimer()
        } else if (closeTime <= 0) {
            resetCloseTimer();
            closeBall();
        } else {
            closeTime--;
            setTimeout(function(){closeTimer()}, 1000)
        }
    }

    // Stop/reset auto close
    function resetCloseTimer() {
        closeTime = 10;
        curIsError = false;
    }

    // Open Pokemon Stats
    function openStats() {

        pokemonStats["infoName"]["Data"].innerHTML = pokeData.name;
        pokemonStats["infoWeight"]["Data"].innerHTML = pokeData.weight;
        pokemonStats["infoHeight"]["Data"].innerHTML = pokeData.height;

        Object.keys(pokemonStats).forEach((statNode) => {

            statNode = pokemonStats[statNode];

            statNode.style.animation = "mn";

            // Set up pokeball
            if (!(statNode.Ball.classList.contains("rollPokeball"))) {
                statNode.Ball.classList.add("rollPokeball");
            } else {
                statNode.Ball.style.animation = null;
                statNode.Ball.style.animation = "";
            }
            statNode.Ball.style.animationDelay = statNode.Delay + "s";


            // Set up stat bar
            statNode.Bar.style.animationDelay = statNode.Delay + "s";
            statNode.Bar.classList.add("openInfoBar");
            statNode.Bar.addEventListener("animationend", function() {
                statNode.Bar.classList.remove("closedInfoBar");
            });



        });
    }

    // Close Pokemon Stats
    function closeStats() {
        Object.keys(pokemonStats).forEach(function(statNode) {

            statNode = pokemonStats[statNode];

            // Set up pokeball
            statNode.Ball.style.animationDelay = statNode.Delay + "s";
            statNode.Ball.classList.remove("rollPokeball");
            statNode.Ball.classList.add("rollPokeball");

            // Set up stat bar
            statNode.Bar.style.animationDelay = statNode.Delay + "s";
            statNode.Bar.classList.add("closeInfoBar");
            statNode.Bar.addEventListener("animationend", function() {
                statNode.Bar.classList.remove("openInfoBar");
            });

        });
    }

    // Open pokeball
    function openBall(img) {

        closeTimer();

        pokemon.style.backgroundImage = "url(" + img + ")";
        if (!curIsError) {
            pokemon.style.backgroundSize = "150% 150%";
            pokemon.style.backgroundPositionY = "65%";
            openStats();
        }

        isBallMoving = true;
        isBallOpen = true;

        createClouds();
        topBall.classList.add("openPokeball");

        // Finalize pokeball
        setTimeout(function () {
            topBall.style.top = "-1.4%";
            topBall.classList.remove("openPokeball");
            isBallMoving = false;
        }, 1500)
    }

    // Close pokeball
    function closeBall(requestOnClose = false) {

        closeStats();

        isBallMoving = true;
        isBallOpen = false;
        topBall.classList.add("closePokeball");
        resetCloseTimer();

        // Remove effects
        setTimeout(function() {removeQuestionMarks();}, 500);

        // Reset ball (in safe time)
        setTimeout(function () {
            topBall.style.top = "35%";
            topBall.classList.remove("closePokeball");
            isBallMoving = false;
            if (requestOnClose) requestPokemon();
        }, 1000)
    }



    // Event for enter in search bar
    userInput.addEventListener("keyup", function (event) {

        if (event.key === "Enter") {

            userInput.value = userInput.value.trim();

            event.preventDefault();

            if (!(isBallMoving)) {
                if (isBallOpen) {
                    closeBall(true);
                } else if (!openSearch) {
                    requestPokemon();
                }
            }
        }
    })

};