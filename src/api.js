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

    // Dynamic CSS sheets
    const cloudCSS = document.createElement("style");
    const questionCSS = document.createElement("style");
    const animationCSS = document.createElement("style");
    document.head.appendChild(cloudCSS);
    document.head.appendChild(questionCSS);
    document.head.appendChild(animationCSS);

    // General divs
    const userInput = getE("searchBox"),
        topBall = getE("topBall"),
        pokemon = getE("pokemon"), // Pokemon img
        hintText = getE("hintText"),
        qMarksLeft = getE("questionMarks1"),
        qMarksRight = getE("questionMarks2"),
        cloudsContainerDiv = getE("clouds"), // Cloud effect container
        attackOptionList = getE("infoAttackListOptions");

    // Attack stat divs
    const infoAttackFT = getE("infoAttackFT"),
        infoAttackAcc = getE("infoAttackAccuracy"),
        infoAttackPP = getE("infoAttackPP"),
        infoAttackPower = getE("infoAttackPower"),
        infoAttackType = getE("infoAttackType");

    let openSearch = false, // Prevent enter key after searching when ball was open (prevent multiple enter hits)
        isBallOpen = false, // Ball control
        isBallMoving = false,
        statsCurrentlyOpen = false;

    let pokeData; // JSON Data
    let pokeAttackAPI = {
        "cached" : {},
        "urls" : {},
    }; // Attack request to URL for API

    // Starting stats data divs
    let statsTable = {
        "container" : getE("infoStatsContainer"),
        "ball" : firstClass(getE("infoStatsWrapper"), ["infoPokeball"]),
        "speed" : getE("infoSpeed"),
        "hp" : getE("infoHP"),
        "attack" : getE("infoAttack"),
        "special-attack" : getE("infoSpecAttack"),
        "defense" : getE("infoDefense"),
        "special-defense" : getE("infoSpecDefense"),
    };

    // Element ID, int delay multiplier
    let pokemonStats = {
        "infoName" : 1,
        "infoWeight" : 2,
        "infoHeight" : 3,
        "infoTypes" : 1,
    };

    // Generate stat element data
    function createStats(nameID = []) {

        let statData = [];
        Object.keys(nameID).forEach((statName) => {

            let statNode = getE(statName);
            statData[statName] = {
                "Wrapper" : statNode,
                "Ball" : firstClass(statNode, ["infoPokeball"]),
                "Bar" : firstClass(statNode, ["infoBar"]),
                "Data" : firstClass(statNode, ["infoBar", "infoData"]),
                "Delay" : nameID[statName] * .10,
            };
        });

        return statData;
    }
    pokemonStats = createStats(pokemonStats);



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

            let startY = randomNum(0, 60) - 15,
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

    // Start API request using fetch()
    function requestPokemon() {
        let currentInput = userInput.value.trim();
        if (currentInput === "") {
            pokeError("Type in a name....");
        } else {

            fetch("https://pokeapi.co/api/v2/pokemon/" + currentInput, {method: "GET"})
                .then(function(response) {
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        pokeError("That's an imaginary Pokémon....");
                    }
                    return response.json();
                })
                .then(function(data) {

                    pokeData = data;

                    writeHint("Here are your results....");

                    let pokeImg = pokeData.sprites || [];
                    pokeImg.front_default = pokeImg.front_default || "../resources/pokeWhat.png";

                    pokeTypes = []; // Clear previous types
                    pokeData.types.forEach(function(typeName) {
                        pokeTypes.push(typeName);
                    });

                    openBall(pokeImg.front_default);

                })
                .catch(function() {
                    if (!contentType || !contentType.includes('application/json')) return;
                    pokeError("That didn't work. Try something else....");
                });
        }
    }

    // Start API for getting attack stats
    function requestAttackData(apiURL, name) {
        fetch(pokeAttackAPI.urls[apiURL], {method: "GET"})
            .then(function(response) {
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.log("Could not get attack stats....");
                }
                return response.json();
            })
            .then(function(data) {

                pokeAttackAPI.cached[apiURL] = data;
                updateAttackStats(apiURL);

            })
            .catch(function() {
                if (!contentType || !contentType.includes('application/json')) return;
                console.log("Something went wrong that wasn't to do with the headers/content type....")
            });
    }

    // Update attack stats to current attack
    function updateAttackStats(attackName) {

        let stats = pokeAttackAPI.cached[attackName];

        let flavortext = "Nothing here....";
        stats.flavor_text_entries.forEach(function(node) {
           if (node.language.name === "en") {
               flavortext = node.flavor_text;
           }
        });

        infoAttackFT.innerHTML = flavortext;
        infoAttackAcc.innerHTML = stats.accuracy;
        infoAttackPP.innerHTML = stats.pp;
        infoAttackPower.innerHTML = stats.power;
        infoAttackType.innerHTML = stats.type.name;

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

    // Set current data
    function setStatData() {

        // Name/Weight/Height
        pokemonStats["infoName"]["Data"].innerHTML = pokeData.name;
        pokemonStats["infoWeight"]["Data"].innerHTML = pokeData.weight;
        pokemonStats["infoHeight"]["Data"].innerHTML = pokeData.height;

        // Types
        let pokeTypes = "";
        pokeData.types.forEach(function(pokeType) {
            pokeTypes = pokeTypes + pokeType.type.name + ", ";
        });
        pokeTypes = pokeTypes.slice(0, -2);
        pokemonStats["infoTypes"]["Data"].innerHTML = pokeTypes;

        // Starting stats
        pokeData.stats.forEach(function(node) {
            statsTable[node.stat.name].innerHTML = node.base_stat;
        });

        // Attack stats
        attackOptionList.innerHTML = "";
        pokeData.moves.forEach(function(node) {
            let attName = node.move.name;
            if (!(pokeAttackAPI.urls[name])) pokeAttackAPI.urls[node.move.name] = node.move.url;
            let tempOption = document.createElement("option");
            tempOption.setAttribute("value", attName);
            tempOption.innerHTML = attName;
            attackOptionList.appendChild(tempOption);
        });
    }

    // Open Pokemon Stats
    function openStats() {

        console.log(pokeData.moves);

        if (statsCurrentlyOpen) return;

        setStatData(); // Set new data

        Object.keys(pokemonStats).forEach((statNode) => {

            statNode = pokemonStats[statNode];

            statNode.Ball.style.animationDelay = statNode.Delay + "s";
            statNode.Bar.style.animationDelay = statNode.Delay + "s";

            // Roll out pokeball
            if (statNode.Wrapper.parentNode.id === "leftInfo") {
                statNode.Ball.style.animationName = "openRollPokeball";
            } else {
                statNode.Ball.style.animationName = "openRightRollPokeball";
            }

            // Open stat bar
            statNode.Bar.style.animationName = "openInfoBar";

            void statNode.Ball.offsetWidth;
            void statNode.Bar.offsetWidth;

        });

        // Starting Stat Custom Animation
        statsTable.ball.style.animationDelay = ".3s";
        statsTable.container.style.animationDelay =  ".3s";

        statsTable.ball.style.animationName = "openRollPokeball";
        statsTable.container.style.animationName = "openInfoStats";
        void statsTable.ball.offsetWidth;
        void statsTable.container.offsetWidth;

        statsCurrentlyOpen = true;
    }

    // Close Pokemon Stats
    function closeStats() {

        if (!(statsCurrentlyOpen)) return;

        Object.keys(pokemonStats).forEach(function(statNode) {

            statNode = pokemonStats[statNode];

            statNode.Ball.style.animationDelay = statNode.Delay + "s";
            statNode.Bar.style.animationDelay = statNode.Delay + "s";

            // Close pokeball
            if (statNode.Wrapper.parentNode.id === "leftInfo") {
                statNode.Ball.style.animationName = "closeRollPokeball";
            } else {
                statNode.Ball.style.animationName = "closeRightRollPokeball";
            }

            // Open stat bar
            statNode.Bar.style.animationName = "closeInfoBar";

            void statNode.Ball.offsetWidth;
            void statNode.Bar.offsetWidth;
        });

        // Starting Stat Custom Animation
        statsTable.container.style.animationDelay = ".05s";
        statsTable.ball.style.animationName = "closeRollPokeball";
        statsTable.container.style.animationName = "closeInfoStats";
        void statsTable.ball.offsetWidth;
        void statsTable.container.offsetWidth;

        statsCurrentlyOpen = false
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
            topBall.style.top = "0";
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
            topBall.style.top = "20vmin";
            topBall.classList.remove("closePokeball");
            isBallMoving = false;
            if (requestOnClose) requestPokemon();
        }, 1000)
    }


    // Right/left buffer size updates for data container wrapping
    const pokeballWrapper = getE("pokeballWrapper");
    const leftInfoWrapper = getE("leftInfoWrapper");
    const leftBuffer = getE("leftInfoBuffer");
    const rightBuffer = getE("rightInfoBuffer");
    let currentHeight;

    // Size checker/updater
    setInterval(function() {

        if (!(pokeballWrapper.clientHeight === currentHeight)) {
            currentHeight = pokeballWrapper.clientHeight;
            leftBuffer.style.height = currentHeight + "px";
        }
        rightBuffer.style.height = leftInfoWrapper.clientHeight + "px"; // Keep right buffer wrap as long as left (prevent wrap overlap)
    }, 10);

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

    // Event for updating attack information when changed
    attackOptionList.onchange = function() {
        let newAttack = this.value;
        if (pokeAttackAPI.cached[newAttack]) {
            updateAttackStats(newAttack)
        } else {
            requestAttackData(newAttack);
        }

    }
};