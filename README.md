<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Command Prompt</title>
    <style>
        body,
        html {
            height: 100%;
            margin: 0;
            background-color: black;
            color: green;
            font-family: 'Consolas', 'Courier New', monospace;
        }

        #terminal {
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            height: calc(100% - 40px);
            /* Adjusted for padding and input height */
        }

        #input {
            width: 100%;
            /* Adjusted width calculation */
            padding: 10px 20px;
            background: #000;
            /* Ensuring background isn't transparent */
            border: none;
            color: green;
            font-size: 16px;
            outline: none;
            font-family: 'Consolas', 'Courier New', monospace;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
        }

        #output {
            white-space: pre-wrap;
            padding-bottom: 30px;
            /* Space for input */
        }

        .small-text {
            font-size: 8px;
            /* Smaller text size */
            font-family: 'Courier New', monospace;
            /* Ensures monospace font */
            white-space: pre;
            /* Preserves spacing and newlines *
            color: green;
            /* Example color */
            background-color: black;
            /* Example background */
            line-height: .5;
            /* Adjust as needed */
            letter-spacing: -1px;
        }
        .vsmall-text {
            font-size: 5px;
            /* Smaller text size */
            font-family: 'Courier New', monospace;
            /* Ensures monospace font */
            white-space: pre;
            /* Preserves spacing and newlines *
            color: green;
            /* Example color */
            background-color: black;
            /* Example background */
            line-height: .5;
            /* Adjust as needed */
            letter-spacing: -1px;
        }
    </style>
</head>

<body>
    <div id="terminal">
        <div id="output"></div> <!-- Added the output div -->
    </div>
    <div id="inputLine">
        <input type="text" id="input" autofocus />
        <audio id="typing-sound"
            src="https://cms-artifacts.motionarray.com/content/motion-array/765581/Digital_Text_mp3_1710867169.mp3?Expires=2026227321707&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=jWNCVrRCLxnaUwfAbWH3yWVbEh0fyPH3zm-1fVKq4qbSh2HO6j5N9rGw3zUK91SkZCL~Hv2B~XsclQQIfwAjVZUTtp~TmH0ZaNWzkS0ZzV3QLtvYBAl3sE9pfojBjUKLykMGdsKrgoZlFwjgRhMYhji4USRhU8ZEuE6-1lm-hgyMFgzCoVjV5-i6PsXqeoAO7LApc-pgczh0TYbb~xjtUVujDyK97rGydQ39OQkTZVcqHR2HjapA0z6ZbXFRgV0WXZuRMEVDPLy~Mo0hwQcgGYlJiejGv6vMCvgI0CXBCGhLJCsSWQzLMPK0eqMJ~NdbHqfCuA4IQ7Ec4ZSdidW5YQ__"
            loop preload="auto"></audio>
    </div>

    <script>
        // Display agent_177 message and start transmission when the page loads
        window.onload = function () {
            processCommand("initialize");
        };
        document.getElementById('input').addEventListener('blur', function () {
            this.focus();
        });

        document.body.addEventListener('click', function (event) {
            if (event.target !== document.getElementById('input')) {
                let textContent = event.target.textContent; // Get all text from the clicked element
                let words = textContent.split(/\s+/); // Split the text content into words based on spaces

                let clickX = event.clientX; // X coordinate of the click

                // Calculate approximate word position based on click coordinates
                let range = document.createRange();
                let closestWord = '';
                let smallestDistance = Infinity;

                words.forEach(function (word, index) {
                    // Remove all punctuation except underscores from the word
                    let cleanWord = word.replace(/[\.,\/#!$%\^&\*;:{}=\-`~()\s]+/g, '');

                    range.setStart(event.target.firstChild, textContent.indexOf(word));
                    range.setEnd(event.target.firstChild, textContent.indexOf(word) + cleanWord.length);
                    let rect = range.getBoundingClientRect();

                    // Calculate distance from click to word center
                    let wordCenterX = rect.left + rect.width / 2;
                    let distance = Math.abs(wordCenterX - clickX);

                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        closestWord = cleanWord; // Use cleaned word without punctuation
                    }
                });

                // Set the input value to the closest word without punctuation
                document.getElementById('input').value = closestWord;
                document.getElementById('input').focus(); // Optionally, focus the input box
            }
        });




        //Typing text function

        function typeText(text,increment = 1, index, audio, terminal, currentWord = '', currentSpan = null, speed = 1, callback = null) {
            if (index < text.length) {
                let currentChars = text.substring(index, index + increment); // Get characters based on the increment

                for (let i = 0; i < currentChars.length; i++) {
                    let currentChar = currentChars[i];
                    if (/[\wäöüÄÖÜß]/.test(currentChar)) {
                        currentWord += currentChar;
                        if (!currentSpan) {
                            currentSpan = document.createElement('span');
                            terminal.appendChild(currentSpan);
                        }
                        currentSpan.textContent += currentChar;
                    } else {
                        if (currentWord.length > 0) {
                            makeClickable(currentSpan, currentWord);
                            currentWord = '';
                        }
                        let punctSpan = document.createElement('span');
                        punctSpan.textContent = currentChar;
                        terminal.appendChild(punctSpan);
                        currentSpan = null;
                        if (currentChar === '\n') {
                            terminal.appendChild(document.createElement('br'));
                        }
                    }
                }

                // Set timeout to type next characters and increment the index by the specified increment
                setTimeout(() => {
                    typeText(text, increment, index + increment, audio, terminal, currentWord, currentSpan, speed, callback);
                    scrollToBottom();
                }, speed);
            } else {
                if (currentWord.length > 0 && currentSpan) {
                    makeClickable(currentSpan, currentWord);
                }
                finalizeTyping(audio, callback);
            }
        }



        function makeClickable(span, word) {
            span.className = 'clickable-word';
            span.addEventListener('click', function () {
                document.getElementById('input').value = word.trim();
                document.getElementById('input').focus();
            });
        }

        function finalizeTyping(audio, callback) {
            // Show input after the message is fully displayed
            document.getElementById('input').style.display = 'inline-block';
            document.getElementById('input').focus();
            audio.pause(); // Stop audio when typing is done
            audio.currentTime = 0; // Reset audio to start
            if (callback) callback();  // Execute callback if provided
        }

        function startTransmission(text, increment = 1, cssClass = '', typingSpeed = 3, callback = null) {
            const audio = document.getElementById('typing-sound');
            const terminal = document.getElementById('terminal');
            const messageContainer = document.createElement('div');
            if (cssClass) {
                messageContainer.className = cssClass; // Apply custom class if provided
            }
            terminal.appendChild(messageContainer);
            audio.play().then(() => {
                typeText(text, increment, 0, audio, messageContainer, '', null, typingSpeed, callback);
            });
        }
        function decrypt(encryptedMessage, key) {
            key = key.replace(/\s+/g, ''); // Remove spaces for processing
            let result = '';
            const codes = encryptedMessage.split(/\s+/); // Split by spaces
            const keyLength = key.length;
            for (let i = 0; i < codes.length; i++) {
                // Repeat or extend the key to match the length of the encrypted message
                const charCode = parseInt(codes[i], 10) ^ key.charCodeAt(i % keyLength);
                result += String.fromCharCode(charCode);
            }
            return result;
        }





        function performDecryption() {
            const encryptedMessage = variables.encryptedMessage;
            const key = variables.decryptionKey;

            if (!encryptedMessage || !key) {
                console.error('Error: Both encrypted message and key must be provided.');
                return;
            }
            const decryptedMessage = decrypt(encryptedMessage, key);
            console.log('Decrypted Message:', decryptedMessage); // Output the decrypted message

            // Call the displayDecryptedMessage function to display the decrypted message
            displayDecryptedMessage(decryptedMessage);
        }

        function displayDecryptedMessage(decryptedMessage) {
            // Assuming startTransmission function displays the message
            startTransmission(decryptedMessage);
        }


        //Messages, to create a new message that gets generated create a new const like "const norwegianSkinwalkerMessage = `text here`;"

        const accessDenied = `
ACCESS DENIED
`;
        const picture = `
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWNK00OOOOOkkkkkkkxxxddddxk0000OkkkkxkkkkxkOO0KXNWWWWWWWWWWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMWNK0Oxolc;,'''....................''''.............'',;:cccccclloxOXWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMWNKOxolc:,'.........        .................................'''',,,,,;;:clx0XWWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMNOolc;,.................   ..     .....            ................'''',,,;;;:::coxOKXNWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMW0d:.....................                                ..................',,,,,,;;;;clodk0XNWWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMWKo'....                                              ..........................'.....'.',;;:::ldk0XNWWMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMW0l,...                                                           ...........................''''.',;:ldkOKXNWMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMW0d,..                                                   ................      ....  ....................'',:coxO0XNWMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMNOl,..                                                       ................           ..      ...............',;:ldk0NWMMMMMMMMMMMMMMM
MMMMMMMMMMMMMNo'...                                                              ..........                        ............'',:cox0NWMMMMMMMMMMMMM
MMMMMMMMMMMNOl'.....                                                            .............................            .......'',,:cokXWMMMMMMMMMMMM
MMMMMMMMMMNxc'.  ..                                                      ................'',,,;;;;;;;,,,'''.......          .......',;:lx0NWMMMMMMMMMM
MMMMMMMMMWKd:.    .                                                    ...............',,:cllooddddddddoolc:,'........... ..  .......',;coOXWMMMMMMMMM
MMMMMMMMMN0o;.                                                               ........';::clooddxxkkkkkkkkxdol:,''...........  ........',;:lkXWMMMMMMMM
MMMMMMMMMW0o,..                                                            ........',;:cclooodddxxkkkOOOOOOkkdl:,'..........  ...........,;lkXWMMMMMMM
MMMMMMMMMW0o,..                                                           ........'';;::cclloooodddxxxkkkOOOOkxol:;,.....................';lkXWMMMMMMM
MMMMMMMMMW0l,...                                                         .........'',;:cccclloooddddddxxxkkOOOOkxoc;'''..............''';lxKNWMMMMMMMM
MMMMMMMMMXx:'..                                                    ...............'',;::cccllooooooooddxxxkkkkkkkxo:,...','.......',:cok0XWMMMMMMMMMMM
MMMMMMMMMO;...                                              .....................'',;;;::ccclloooooddddddxxxxxkkkkdl;....''''''';:lxOXNWMMMMMMMMMMMMMM
MMMMMMMMMk...                                          ........................'',,,,;;;:::cccccllllllllllllclloxxdo;........',cdOKNWMMMMMMMMMMMMMMMMM
MMMMMMMMMk...                .........                   ............'',,''',,,,,,,,,,,,,,,,,,''''''...''',,;;;;clooc'.. ....,lxKWMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMNd.                .........                           ......'',,,,,,'''''''...................',;:cllcccloo;..  ...:kNWMMMMMMMMMMMMMMMMMMMMM
MWMMMMMMMMNc                .........   ...............   . ... .............''.......................'',;;:ccloooodxl'.....,kWMMMMMMMMMMMMMMMMMMMMMMM
MWWWMMMMMMMx.              ................................................................................'',;:clodxd:.....lXMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMM0,              ..................                 ................'''''''.........       ..........',cldxxc'...;kWMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMXOo'..            ..............                 .          .........,:ccc:,,'....  ...      .,::;''''',:ldxkl'...':okNMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMKl.               .............       ..       .....       .........',:loolcc:;,..............,::cclllcllodxkx;.';,..,kWMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMO.   ..          ...................................................,;:lddooolc:;,'......'',;;::cloddddddxxkko;cdo;.'lXMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMX: ......        ...................................................',;codddddooolc::;;,,;;;;::clooddddxxxxkkd:;:cl:,lXMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMNc.....          ...................................................',;:lddddddddoollllccccccllloodddddxxxxxkd;..';lcdNMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMK:..        ... .....................................................',;clodddddddooollllllllllllooodddddddxxd:...,clxNMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMXc...      ...........................................................',:loxxxddoolcclllooooooollllllloooooodoc;;;:ccOWMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMK:........   .........................................................';:ldxkxxddoc,,;;:cllllooolllllllllllooodd:;:xNMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMXc.....................................................................',:cllccclc;,'.',;:cccllllcccclllllooodxolxXMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMNx,.................................................. ..................'''''',:c::;,...',;;::cccccccclllllodddkXMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMXo'.......... ......................................             .......';:::clllc:;''.'',;;::::cccclllc::ld0NMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMWKxlc;,...    ........................................    .............,:cccccccccc:;,'',,;;::::cclllclxk0NMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMWXk,...   ...............................................',,''''',,;;::cllllcc:;;;,,,;;:::ccccccl0MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMNx'....  ..............................................................',:cc:;,,,,,;;::::cc:cccxNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMO,...... .............................................................   ..,;,'',,;;:ccc:;::ccoKMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMWx,..........................................                               .,;,,,;;:cc:::::::ckWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMXo'....... ...............................                   .......     ...,;:;;;;::cc::::::lOWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMM0:'..........................................  .........'''',,,;;;;;....,;::::::;;::cc:::::cdKWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMXl.................................................',''',,',;,;:;,',,,:llllcccc::;::::::::oONMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMWO:.................................................'''',,,,,,,,,,,,,;:cclcccccc::;::::::lkNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMNk;'......................................................'''''.'.''',,;::::::::::;;;;;:lONMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMWKo,..........     ....   .....     .. ................................'',;;,;:::;;,,;;;ckNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMWKx:'.......   ...     ....   .....   ... .............................'',,,;;;;::::;,,,,oXMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMNK0K0d:,'.........    ...     ....     .      ...........................',;;;::::;;;;;;,,'.,xNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMWWXOxooolllc::;;,'.....      ...       .....       .........................''',,;;:::;,;;,'.';lOWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMNK0Okxdoooollllcccccc:::;,,'....    .          ......     ...........................',,,,,'''',;cdKWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
X0xoooodoooooooollllcccc::::::;;,''...               .....................................''.';:clldKWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
ddddddddddddoooooolllllccc::::;;;;;;;,'.....      .......................................',;clollldXMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
xxxxxxxxxddddddddooollllcccc:::;;;;;;;;;;,,''.....   ................................'',;;:cllllcdKMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
xxxxxxxxxxxxxxxxxddddooolllccc::::;;;;;;;;;;;;,,,'............................'''''',,,;;:ccccccoKWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
kkkxxxxxxxxxxxxxxxxxxxdddoolllcccc::::;;;;;;;;;;;;;;;;;,,''..........''''''''....''''',;:::::cco0WMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
kkkkkkkkkkkkxkkkkkxxxxxxxdddooolllcccccc::::;;;;;::::::ccclcc:,''.'''',,,,,,''''.'''',,;:::::clkNMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
`;
        const USA= `
================================================================================
                           *** CLASSIFIED DOCUMENT ***
                     ISSUED BY: Office of Internal Security
                      TO: Authorized Syunik Command Units
                    SECURITY LEVEL: TOP SECRET - PRIORITY RED
================================================================================

SUBJECT: U.S. Medical Teams and WMD Search Operations in Syunik  

--------------------------------------------------------------------------------
INTELLIGENCE SUMMARY:

The presence of U.S. "medical teams" and associated operations within Syunik
Province has escalated significantly. Officially, their stated mission is to
provide medical support for the Gorayk outbreak. However, a deeper analysis 
reveals a dual-purpose operation involving the deployment of specialized WMD 
search teams under the guise of humanitarian aid.

While the outbreak necessitates international cooperation, we must approach U.S.
actions with *extreme caution*. Their activities suggest a concerted effort to
exploit our current vulnerability, potentially positioning themselves as
arbiters of Limaria's internal security and seizing the opportunity to extend
influence over strategic assets.

--------------------------------------------------------------------------------
OBSERVATIONS AND FINDINGS:

1. **Medical Team Operations**:
   - U.S. personnel have been observed establishing field hospitals and triage
   centers around the containment zone. While these efforts appear aligned with
   their stated mission, there are troubling indications of information-gathering
   disguised as "public health surveys."

   - Reports suggest the deployment of unmarked drones from these centers. The
   pretext of monitoring viral spread could be a cover for surveillance of
   sensitive infrastructure and military movements.

2. **WMD Search Teams**:
   - Known U.S. units specializing in counter-WMD operations have been detected
   operating covertly within the province. Their presence coincides with the 
   discovery of key materials indicating a possible external threat linked to
   WMD production.
   
   - Equipment brought by these teams includes radiation detectors, chemical
   analysis kits, and containment apparatus. These resources suggest their 
   mission extends beyond the Gorayk outbreak and into broader 
   intelligence-gathering on Limaria's capabilities.

3. **Coordination with Local Elements**:
   - U.S. personnel have approached key officials within Syunik's infrastructure
   and security apparatus under the pretense of collaboration. This effort
   should be viewed as an attempt to gain leverage and insert themselves into
   critical decision-making channels.

--------------------------------------------------------------------------------
ANALYSIS:

While the U.S. activities are presented as benevolent, their alignment with
strategic military objectives cannot be ignored. Their dual-purpose operations
reflect a deliberate effort to undermine Limarian sovereignty under the guise
of humanitarianism. The search for WMDs, if genuine, is not solely in our
interest but appears to serve their geopolitical agenda, potentially aiming to
preemptively neutralize threats while asserting dominance over our region.

The timing of their actions, coinciding with the Gorayk outbreak, is unlikely
to be coincidental. By presenting themselves as indispensable allies, the U.S.
seeks to embed itself deeper into our affairs and establish a foothold for
broader regional influence.

--------------------------------------------------------------------------------
DIRECTIVES:

1. **Enhanced Surveillance**:
   - All U.S. medical and WMD search operations must be closely monitored.
   Ensure that all movements, communications, and activities are logged and
   reported to the Governor's office daily.

2. **Controlled Collaboration**:
   - Maintain professional cooperation but restrict access to sensitive areas,
   personnel, and intelligence. Any requests for additional support must be
   vetted at the highest levels.

3. **Counterintelligence Measures**:
   - Deploy internal operatives to observe U.S. personnel covertly. Identify
   individuals seeking to bypass established protocols or engage in
   unauthorized activities.

4. **Containment of U.S. Influence**:
   - Reinforce public messaging to emphasize Limarian leadership in managing
   the crisis. Frame external involvement as supplementary and temporary,
   ensuring the population does not view foreign actors as primary protectors.

--------------------------------------------------------------------------------
CONCLUSION:

While the U.S. presence may yield short-term assistance, it is a Trojan Horse
strategy designed to erode our autonomy. Vigilance and restraint are critical
to ensuring Syunik remains under the control of its rightful authorities. Trust
is not an option. Every action must be scrutinized; every motive questioned. 

Failure to act decisively risks ceding control of Syunik’s future to foreign
powers.

--------------------------------------------------------------------------------
FOR INTERNAL USE ONLY. UNAUTHORIZED DISSEMINATION IS TREASON.  

SIGNED,  
**Director of Internal Security**  
Syunik Province  
"Authority is our shield; vigilance is our weapon."
================================================================================

`;
        const LLF = `
================================================================================
                              CLASSIFIED DOCUMENT
                             EYES ONLY - TOP SECRET
================================================================================

Subject: Limaria Liberation Front (LLF) - Suspected Pursuit of WMDs

Security Level: TOP SECRET
Authorized Access: [AUTHORIZED PERSONNEL ONLY]

--------------------------------------------------------------------------------
                           INTELLIGENCE SUMMARY
--------------------------------------------------------------------------------

ORGANIZATION: Limaria Liberation Front (LLF)
TYPE: Insurgent Faction
LEADERSHIP: Believed to be headed by [REDACTED]
ACTIVITY ZONES: Southern Limaria, Syunik Province, and unconfirmed locations

THREAT ASSESSMENT: HIGH
The LLF is suspected of actively pursuing weapons of mass destruction (WMDs). 
This represents a significant escalation in their operational capacity and 
regional threat level. 

--------------------------------------------------------------------------------
                       SUSPECTED WMD ACQUISITION CHANNELS
--------------------------------------------------------------------------------
1. **Foreign Alliances**:
   - Intelligence suggests the LLF may be engaging with sympathetic foreign 
     entities capable of supplying advanced weaponry or nuclear materials.
   - Possible connections to state and non-state actors under investigation.

2. **Domestic Resources**:
   - Reports indicate potential attempts to procure materials locally, including 
     repurposing industrial chemicals and exploiting unregulated supply chains.

3. **Black Market**:
   - Evidence suggests LLF operatives may be negotiating access to WMD 
     components via clandestine arms networks operating within Limaria.

--------------------------------------------------------------------------------
                          OBJECTIVES AND MOTIVATIONS
--------------------------------------------------------------------------------
- **Regional Dominance**: Achieving strategic leverage over Limarian government 
  forces and foreign powers through deterrence or coercion.
- **Autonomy Assertion**: Using WMD capabilities to force recognition of 
  territorial claims.
- **Intimidation Tactics**: Instilling fear to weaken public and military 
  morale within contested areas.

--------------------------------------------------------------------------------
                              CURRENT DEVELOPMENTS
--------------------------------------------------------------------------------
- Unverified reports of nuclear material shipments moving through southern 
  corridors. Investigation ongoing.
- Increased LLF activity near critical infrastructure. Surveillance assets 
  deployed.
- Enhanced coordination between Limarian military intelligence and allied 
  monitoring agencies.

--------------------------------------------------------------------------------
                        RECOMMENDED ACTIONS
--------------------------------------------------------------------------------
1. **Surveillance Escalation**: Deploy additional aerial and satellite 
   reconnaissance over suspected LLF strongholds.
2. **Interdiction Operations**: Strengthen checkpoints and monitor known 
   smuggling routes for prohibited materials.
3. **Diplomatic Channels**: Engage with regional allies to prevent external 
   support to the LLF.
4. **Containment Preparedness**: Plan for rapid response to neutralize any 
   confirmed WMD threat.

--------------------------------------------------------------------------------
                         END OF DOCUMENT
--------------------------------------------------------------------------------

`;
        const norwegianSkinwalkerTransmission = `
==========================================================================
                *** INCOMING TRANSMISSION RECEIVED ***
==========================================================================

>> SOURCE: EXTERNAL DATA NODE - SECTOR 7
>> TRANSMISSION TYPE: ENCRYPTED NUMERIC DATA
>> PRIORITY: HIGH

==========================================================================
[TRANSMISSION CONTENT]

040 000 025 027 015 030 006 069 019 025 031 000 031 024 022 009 074 027 

013 022 018 030 067 012 025 010 068 019 030 025 007 022 017 023 010 010 

008 066 010 015 015 008 010 072 087 013 024 027 070 024 025 022 001 013 

028 023 074 007 026 018 001 022 017 017 069 086 061 015 004 027 082 020 

005 002 020 078 016 076 021 015 018 016 019 020 003 024 019 071 004 000 

069 023 026 007 029 008 014 017 068 078 008 012 009 031 068 025 012 021 

029 005 071 023 076 016 006 016 023 030 029 092 076 038 009 013 007 003 

004 020 027 091 066 017 021 085 024 007 022 028 014 088 025 004 004 079 

006 005 009 024 027 018 004 077 067 005 010 026 006 000 007 029 078 012 

011 026 022 024 016 031 009 072 002 017 065 011 024 018 000 022 015 029 

010 076 006 006 068 012 014 009 090 027 006 020 004 027 005 024 008 003 

076 024 030 101 109 115 101 108 118 101 115
[TRANSMISSION COMPLETE]
==========================================================================

>> KEY ID: NORWSKI10890053

==========================================================================
                    >>> END OF TRANSMISSION LOG <<<
==========================================================================

`;
        const norwegianSkinwalkerKey = `
==========================================================================
[ACCESS REQUEST INITIATED]

>> REQUESTING ACCESS TO: AXIOM 3305
>> REQUEST LEVEL: CLASSIFIED - ALPHA 1 CLEARANCE REQUIRED
>> PURPOSE OF ACCESS: ACTIVATION OF PROTOCOL “NORWEGIAN SKINWALKER”

[VALIDATING CREDENTIALS...]
[CREDENTIALS AUTHORIZED - ACCESS GRANTED]

==========================================================================
[SECURITY LOG ENTRIES]
>> LOG 43876: INITIATE SEQUENCE STARTED BY OPERATOR XJ47-RP9
>> LOG 43877: CREDENTIALS SUBMITTED FOR AUTHORIZATION
>> LOG 43878: ACCESS APPROVED FOR OPERATOR XJ47-RP9

==========================================================================
[ENCRYPTION KEY RECEIVED]

imvuh mregv hemqx njkhw ymcmw nddvp tft e  cdob zfamy dwbmi frvcs cynjr 

ttnz  ubkv  xngsr gqgdn qlaja dry f vggpo eturo iithn mmjwd oe fi dgvlb 

cgvly rlrfj bwlqi w bfp uzuwj kxmla oskbv tejac cehai iznan wyjyz zhcba 

nvvud fsmlg udxfl zviaj odq f pllv
==========================================================================
                        >>> END OF REQUEST <<<
==========================================================================
`;
        const initialize = `
====================================================================
***************** SECURE SYSTEM ACCESS: TERMINAL 7 *****************
====================================================================
[LOGIN SUCCESSFUL]

OPERATOR ID: XJ47-RP9
>> WELCOME TO TERMINAL 7
>> STATUS: ACTIVE - READY FOR COMMAND INPUT
>> LOCATION: REMOTE ACCESS

====================================================================
[AVAILABLE COMMANDS]
>> LOG: Access log database
>> CLEAR: Exits out of current command tree
>> TRANSMISSION: Access transmission database
>> MAP: Access map

[USER TIP]
>> Use the HELP command for information on specific commands.
>> Commands must use underscores (_) in place of spaces

====================================================================
>>> AWAITING INPUT <<<
====================================================================
`;
        const A1 = `
1
`;
        const A1_1 = `
1.1
`;
        const A1_2 = `
1.2
`;
        const A1_1_1 = `
1.1.1
`;
        const A1_1_2 = `
1.1.2
`;
        const drone = `
00000000000000000000000000000000000000000000000000000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOO00OOOOOOOOOOOOOOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkxxxxxxkkkkkkOOOOOOO000000O0OOOOOOOOOOOOOOOOOkkkkkkkkkkkxxxxxxxxxxxxxxxxxxxxxxxkkkkkkkkkkkkkkkkOOOOOOOOOkkkkkkOOOOOOO00K000OOOOOOOOOOOOOOO0OOkkkkkkkkkkk
00000000000000000000000000000000000000000OOOOOOOOOOOOOO000000000OO000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkxkkkkkkkkkOOOOO00000000000000000OOOOOOOOOOOkOOkkkkkkkkkkkkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkkkkkkkkkkkkkkkkkkkkOO0000000KKKK000OOOOO000OO00000OOkkkkkkkkkkk
OOOOOOOOOOOOO00000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO00OOOOOOOOOOOOOOOOOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOOOOOOOOOOOOkkkOOOOOOOOOO000000KKKKKKKKKKKKKKKK00000000O000OOOOOOOOOOOOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkxxxxxxkkkkkkkkkkkOOOO00OO00KXXXKKKKK00000OOOOOOOO0000K000OOOkkkkkkkkkk
kkkkkkkkkkkOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO00000000000000000000000000000OOO000OOOOOOOOOOO0000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKKKKKKKKKKKKK00000000000OOO0000000000000000000000OOOOOOOOkkkkkkkOOOOOOO0000KKKKXXXXXNNNXXKKK00OOOOOOOOOO00000KKK0000000OO00000
kOOOOOOOOOOOOOOOOOOOOOO000000OOOOOOOO000000000000000000000000000KKKKKKKKKKKKKKKKKKK000000KKK00000000000KKKKXXXXXXXXXXKKKKKKKKKKKKKKKKKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000OOOOOOOOOOOOOOO0000000000KKXXXXXXXXXXXKK000OO00KKKKKKKKKKXXXXXXXXXKKKKXXXX
OOOOOOOOOOOOOOOOOOOOOO0000000OOO000000000000000000KK00000000000KKKKKKKKKKKKKKKKKK000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKKKKKKKKKKKK0000000000000000000000OOOO000000000000000000OOO00000000000OOOOOO00KKKKKKKXXKK00KKKKKKKXXXKKXXXNNNNNNNNNNNNNNNNNNN
kkkkOOOOOOOkkkOOOOOOOOOOOOOOOOOOOOO00000000000000000000000000000000000000000000000000000000000000OO000KK0000000KKKKK00000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000OOOOOOOOOOOO00000000000000000000000000OOOOOOOOOOOO00000KKKKKKKKKKXXXXXKXXXXXXXXNNNNNNNNNWWNNNNNNNNN
kkkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOOOOOOOOOOO0000000OOOO00O00000000000O00000000OOOOOOOOOOOOOOOOOOOOOO00000000000000000000OOOO000000000000000000000000000000000KKKKKKKK00000000000000OO000OOOOOOOOOOOOOOOOOOOOOOOOOOOO0000000000000000000000000000000000000KKKKKKKKKKKKKKKKXXXXXXXXNNNNNNNNNNNWNNNNNNNNNNNNNNN
xxxxxxxxxxxxxxxkkkkxxkkkkkkkkkOkkOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO0000000000000OOOOOOOOOOOOOOOOOOOOOOO0000000000000000000000000000000O000000000000OOOOOOOOOOOOOOOOOOO00000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKXXXXXXNNNNNNNNNNNNNNNNNNNNNNNNNNNN
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOOOOOOOOO00O00O0000OOOOkkkkkkkOOOOOOOOOO000000000000000000000000OOOOOO0000000000000000000OOOOOO000000000000000000000000000000KKKK000000KKKKKXXXXXKKKKKKKKKKKKKKKKKKKKKKKKKXXXXXNNNNNNWWWWNNNNNNNNNNNNNNNNNN
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkkkkkkkkkkkkkkkkkkkkkkkkkOOOkkOO0000000000000000000000000000KK00000000000KKKKKKKXXXXXXXXXXXXKKXXXKKKXXXKK0000000000000000KKKKKK00000000000000000000KKKKKK000000000KKKKKKXXXXKKKKKKKKKXXXXXXXXXXXKXKKKKKKKKKKKKKKKKKKKKXXXXNNNNNNWWWNNNNNNNNNNNNNXXXXXX
xxxxxxxxxxdddddddxxddxddddddddxxxxxxxxxxxxxxxxxxxxxxxxxxkkkkkkkkkkkkkkkkkkkkkkkkOOO000KXXXXXXXXXXXXXXXXXXXXXNXXXXXXXXXXXXXXXXXXXXXXNNNNNNNNNNNNNNNNNNNNNNNNNXXKKK000000000KKKKKKKKKKK0000000000000000000KKKKKKK00000KKKXXXXXXXXXXXXKKKKKKKKKKXXXXKXXXXXXKKKKKKKKKKKKKKKKKKKKXXXNNNNNNNNNNNNNXXXXXXXXXXXXXXXX
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkkkkkkkkkkkkkkkkkkkkkkkOO0KXXXXXXXNNNNNNNNNNNNNNNNNNNNXXXXXXXXXXXXXXXXXNNNNNNNNNNNNNNNNNNNNNNNNNNNXKKKKK0000000000000000000000000000000000000000KKKKK00000KKXXXXXXXXXXXXXKKKKKKKKKKKKKKKKXXXXXXXKKKKKKKKK000000KKKKXXXXXNNNNNNNXXXXXXXXXXXXXXXXXXXX
kkkkOOOOOOOOkkOOOOOOOOOO0OOOOOkkkkkkkxxxxxxxxxxxxkkkkkkkkkkkkkkkkkkOOOOOOOkkkOO0000KXXXXXXXXNNNNNNNNNNNNNNNNNNXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXNNNNNNNNNXXKK0000000000000000000000OOOO00000000000K000000KKKK000000KXXXXXXXXXXXXXXKKKKKKKKK000KKKKKKKKKKKKKKKKKK000000000KKXXXXXXXNNNXXXXXXXXXXXXXXXXXXXXXXX
O000000000KK000KKKKKKKKKKKKKK000000000OOkkkOOOOOO0000OOOOOOOOOOOO000000000000KKKKKKKXXXXXXXXXNNNNNNNNNNNNNNNNXXXXKKKKKKKXXXXXXXXXXXKKKXXXXXXXXXXXXNNNNNNXXK00000OOOOOO00000000000O00OO00000000KKKKKK0000KKKKKKKKK000KKKXXXXXXXXXXKKK00000000000000KKKKKKKKK000000OOOO000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
000000000KKKKKKKKKKKKKKKKXXXXXKKKKKKKK0000000KKKKKKKKKK000000000000KKKKKKKKKKKKKKKKKXXXXXXXXXXXXXXXXXXXXXNNXXXXKKKKKKKKKKKKKKKXXXKKKKKKKXXXXXXXXXXXXXXXXXKK00OOOOOOOOO00000000000KKKK000000000KKKKKKKKKKKKKKKKKKKKK000KKKKXXXXXKKKK0000000000000000000000000000000OO000KKXXXXXXXXXXXXXXKKKKKKKKKKKKKKKKKKKKK
000000000000KKKKKKKKKKKKKXXXXXXXKKKK0000000000KKKKKKKKKKK000000000KKKKKKKKKKKKKKKKKKKKKKXXXXXXXXXXXXXXXXXXXXXKKKKKKKKKK000KKKKKKKKKKKKKKKKKKKKXXXXXXXXXXXXKK000000000000KKKKKKKKKXXXXK000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000OOO00000000000000000000000000KKKKXXXXXXXXXXXKKKKKKKXXXXXXKKKKKKKKKKK
0000000OO000000000000KKKKKKKKKKKK000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000KKK00000KKKKKKKKKKKKKKKKXKKKKK000000000KKKKKKKKKKKKXXXXK0000000000000KK000000KKK000000KKKKKK000000000OOOOOOOOOOOOOO0000000OO000000O00KKKKKKXXXXXXXXXXXXXXKXXXXXXKKKKKKKKKKKKK
OOOOOOOOOOOOOOO000000000KKKKKK00000OOOOOOOOOOOOOOO00000OOOOOOOOOOOOOOOOOOOOOOOOOOOO0000000000000000000KKK00000000000OOOOOO000000000000000000000KKKKKKKKKKK0000000000000000KKKKKKKKKKKKK000O00000000000000000000000000000KKK0000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO000000KKKKKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKK
kkkkkkkkkkkkkOOOOOOOOOOO0000000OOOOOOOkkkkkkkOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO000OO00000000OOOO00000000000KKK0000000000OOOOO000000000OOOOOOOOOOOOOOOO00000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO0000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK
OOOkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkxxxxkxxxxxxxxxxxxxxxxxxxxxkkkkkkkkkkkkkkkkkkkkkxxxxxxxxxxxxxxxxxxxxxxxxxkkkkkkkkkkkOOOOOOOOOOOOOOOOOOOOO000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOkOOOOOOOOkOOOOOOOOOOOOOOO000OOOOO0000000000KKKK00000000KKKKKKK000000000
XXXKKK0000OOOOOOOOOOO00000000OOOkkkkkkkkkkkkkkkkkkkkkxxxxxxxxxxxxxxkkkkkkkkkxxxxxxxxkkxxxkxxkxxxkkkkkkkkkkkkkkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxkkkkOOOOOOOOOOOOOOOOOOOOO000000000000000KKKKK00OOOOOOOOOOkkkkkkkkkkkkkkkkkOOOOOOOOOOOkkkkkOOOOOOOOOOOOOkOOOOOkkOOO000OOO0000000000000000000000000000000000000000
NNNNXXKKKKKKKKKKKXKKXXXXXXNXXXXKK00OOOkkkkkOOOO0000000000000000000000KKKKKK000OOOOOOOOOOOOOOOOOOOOO0OOOO000OOOOkkOOOOOOOkkkkkkkkkkkkkkkkkkkOOOOO00000000OO0000000000000000000000000KKKKKKKKK00OOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOkkkkkkkkkkkkOOOOOOOOOOOOOOO0000OOOOOOOOOOOOOOOOOOOOOOOOOOOO
NNNNXXKXXXXXXXXNNNNNNNNNNNNNNNNNNXXXKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXKKKXXXXXXXXXKKKKK000000KKKKKKKKKKKKKKK0000OOOOOOOOOOOOkkkkkkkkkkkkkkkOOOOO000000000000000000000000000000000KKKKKKKKKKKKKKK00OOOOkkkkOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOkkkkkkkkkkkkkOOOOOOOOO
NNNXXKKKXXXXXXNNNNNNNNNNNNWWWNNNNNXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXNNNXXXXXXXXXKKKKKXXKKKKKKKKKKKKKKKK000OOOOOOOOOkkkkkkkkkkkkkkkkkOOO0000000000000000000000000000000000000000KKKKKKK0000OOOOOOkkkkkkkkkkkkkkkkkkkkkkkkxxxxxkxxxxxxxxkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
NNXXKKKKKXXXXXNNNNNNNNNNWWWWNNNNNNNNNXXXNNNNXXXXXXXXXXXXXXXXXXXXXXXXXXNNNNNXXXXXXXXXXXXXXXXXKKKKKKKKKKKKK000OOOOOOOOOkkkkkkkkkkkkkkkOOO00000000000000000000000000000000000000000000000000OOOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkxxxxxxxxxxxxxxkkkkkkkkkkkkkkOOOkkkkkkkkkkkkkkkkkkkkkOkkkOkkkkkkkkkkkkkkkkkkkkkkkkkk
XXKKKKKXXXXXXNNNNNNNNNNWWWNNNNXXXXXXNNNNNNNNNNXXXXXXXXXXXXXXXXXXXXXXXNNNNNNXXXXXXXXXXXXXXXKKKKKKKKKKKKKKK000OOOOOOOOkkkkkkkxxxxkkkOOOO000KK00000000000000000000000000000000000000000000000OO0000000OOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
XXXKKKXXXXXNNNNNNNNNNWWNNNNNXXXXXXXXNNNNNNXNXXXXXXXXXNNNXXNXXXXXXXXXNNNNNNNNNXXXXXXXXXXXXKKKKKKKKKKKKKKK000OOOkkkkkkkkkkxxxxxkkkOOO00000KKK00000000000000000000000000000000000000KKKK00KK00000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOkkkkkkOOkkkkkkkkkkkkkkkkkkkkkkkkkkkxxxxxxxxxddddddddddxxxkkkkkkkkkkkkkkkk
KKKKKKKKXXXXXNNNWWWWWWNNXXXXXXXXXXXXNNNNXXXXXXXXXXXNNXNXXXXXXXXXXXXNNNNNNNNNNNNXXXXXXXXXXXKKKKKKKKKKKKKK000OOkkkxxxxxxxxxxxkkkOOO000KKK0K000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKK00000000000000KK0000000OOOOOOOkkkOOOkkkkkkkkkkkxxxxxxxdddddddddddooooddddddddxxxxxxxxkkkkkkkkkkkkkkkk
XXXKKKKKKKKKXXXNXXXXXXXXXXXXXXXXXXXXXNNNXXXXXXXXXXXNNXXXXXXXXXXNNNNNNNNNNNNNNNNNNXXXXXXXXKKKKKKKKKKKKKK000OOkkxdddddddddxxkkOOO000KKKK000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKK000000KKKKKKKKKK000000OOOkkkkkkxxxxxxdddddoooooooooooodddddddxxxxxxxxxkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
NNNXXXXXXXXXXNNXXXXXXKKKKKKKKKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXNNNNNNNNNNNNNNNNNNXXXXXXXXKKKKKKKKKKKKKKK000OkkxdooooooodxxkkOO000KKKKK000000000000000000000000000000000KKKKKKKKKKKK0KK00KKKKKKKKKKKKKKKKKK000000000OOOOOkkkxxxddddooooooooooddddddxxxxxkkkkkkkkOOOOOkkkOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
NNNXXXXXXXNNNNNNXXXXXXXXXXXXXXKKKK00000KKKKKKKKKKKKXXXXXXXXXXNNNNNNNNNNNNNNNNNNNNXXXXXXKKKKKKKKKKKKKKKKK00Okdolc::clodxkkOO000KK00000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKK00OOkxxxddddoooooooooooooodddddxxxxxkkkOOOOOO0000000000000000000000OOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
NNNNNNNNNNNNNNXXXXXXXXXXXXXXXXXXXKKKKKKKKKKKKKKKK000000000000KKKKXXXXXNNNNNNNNXXXXXXXXXKKKKKXXKKKXXXXXKKXK0xl;'.,:codxkO000KKKKK0KKKK00000000000000000000KKKKKKKKK0000000OOOkkkkxxxxdddooooooooooooolloooodddxxxkkkOOO0000000KKKKK00K000000000000000000000000000000000OOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
XXXXXXXXXXXNXXNXXXXXXXXXXXXXXXXXXXXXKKKKXXXXXXXXXXXXNNNXXKK00000000000OOOOOOOO0000KKKKXKKKXKkkOOkdddllloool;.  .':ldO000KKKKKKKKKKKKKKKK0000OOkkkxxdddoooolllccc:::;;:;;;::;;::cccclllooddxxkkOOO000000K000000KKKK000KKKKKKKKKKKKK00000000000000000000000000000OOOOOOOOOOOOOOOOOkOOkkkkkkkkkkkkkkkkkkkkkkkkk
NNXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKXXXXXXXXKKKKKKKKKKKKKKKKK00000KKKKKK000OOkkxxxxddddoolloddddlodoc;;;.  ..  .,,,,'':oxkxxxxxolllcc:::;;::::;'.............''',,;;;::ccllooddxxxxkkkkkkkkkOOOOOOOOOOO00000O00000000000000KKK0KKKKKK00000000000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOkkkkkkkkkkkkkkkk
NNNNXXXXXXXXXXXXXXXXXXXXXXXKKKK0KKKKKKKKKKKKXXKKKKKKKK00000OOOOkkkkkkxxxxxxxxxxdddol:;,''..,,,,............'::,..';:l:'............',,;:cll:;;::cclloodddxxxxxxxxxxxxxkkxxkkxxxkkkkkkkkkkkkkOOOOOOOO00OOOOO000000000000000000000000000000000000000000000000000OOOOOOOOOOOOOOkkkOOOOOOOOOOOOOOkkkkkkkkkkkkkkk
XNNNNXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKKKKKKKKKKXXXXXXXXXXXXXXXKKKKKXXXXXXXXKKKKKK00000000OOOkkxxxdolc;;;'..  .;,;;;:lodddoodddddxxxkkkkOOOOOOO000000000000000000000KKK00KKKK000000000000000000000000000000000000000000000000000000000000000000000000000000000000OOOOOOOOOkkkkkkkkkkkkkkkkOOOOOOOOOkkkkkkkkkkkkk
XNNNNNXXXXXXXXXXXXXXXKXXKKKXKKKKKKKKKKKKKKKKKKKXXXXXXXKKKKKKKKKKKKXXXXXXXXXXXXKKKKKKKKKKKKKKKKXXX0kkdcc,..:dk0OkKKKKKKKKKKK000000000000000000KKKK000000000000000000000000000000000000000000000000000000OOOOOOO0000000000000000000000000000000000000000000000OOOOOOOkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOOOOOkkkkk
NNNNNNXXXXXXXXXXXKKXKKKKKKKKKKKKKKKKKKKKKKKKKKXXXXXXXXKKKKKKKKKKKKKXXXXKKKKKKKKKKKK0kddkOOO00000KOdoc'...'.,ldoxKKKKKKKK000000000000000000000KK000KKK000000000000000000000000000000000000000000000000OOOOOOOOOOOOOO000000000000000000OOOOOOOOOOO00000000OOOOOOOOOkkkkkkkkkkkkkOOkkkOkOOOOOOOOOOOOOOOOOOOOOOO
NNNXXXXXXXXXXXXKKKKKKKKKKKKKKKK0000KKKKKKKKKKKXXXXKKKKKKKKKKKKKKKKKKXXXKKKKKKK0KKKk;. .:dkkxxxxxkxoc:,..',;ldooxkOKKKKKKK00000000000000000000000000KK00000OOOO0000000000000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOkkkkkkkkkkkkkkkOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
NXXXXXXXXXXXXKKKKKKKKKKKKKKKKK0000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKK00kxkOOO000Odx00d;....lxkkxxddddl:,'';lllccllllldO0KKKKK0000000000000000000000000000000OOOOOO00000OO00000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOkkOOOOOOOOOOOOOOkkkkkkkkkkkkkkkOOOOOOOOOOOOkkkOOOOOOOOOOOOOOO
XXXXXXXXXXXKKKKKKKKKKKKKKKKKK000000000KKKKKKKKKKKKKKKKKKKKK0kxkkl:lodxx:;odkOOOOO00OOkddxkkkkkkxxdlc:;:clooddoooddooddddxkO000000000000000000000000000000OOOOOOOOO00OOO00O0000000000OOOOOOOOOOOOOOOOOOOOOOOOOOkkOOOkOOOOOOOOOOkkOOOOOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOOOkkkkkkkkkkkOOOOOOO
XXXNNNXXXXXXKKKKKKKKKKKKKK00000000000000000000000KKKKKKKKKxc:lxOl';cokO:.cdxOOOOOOOOOO0000OOkxxdkkl::::,,;;:clooddoodolc:ccloodxkO000000000000000000000000000O000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO0OOOOOOOOOOOOOOOOOOOOOOOOOOkkkkkkkkkkkkkkkkkkkkkkOOOOOOOOOOOOkkkOOOOkkkkkkkkkkkOkkkk
XXXXNNNXXXXXKKKKKKKKK0000000000000000000000000000000KKKKK0c.';cc'..';:c'.:loxkkkkOOOOOOOOO0Okxxoxkl;:'    ....',:;,;ccclllll:,':llok0kddxkO00000000000000000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOkkkkkkkOOOO0000000000OOOOOOOOOOOOO00000OOOOOOO
XXXXXXXXXXXKKKKKKKKK00000000OOO000000000000000000000KKKKKKd. ..     .',,ccclodxxkkkOOOOOOO00Okxoooc,,.    .....''.....',,;;;;'..,,'',..:l:o00000000000000000000000000000000000000000000000OOOOOOOOOOOO0000OOOOOOO00OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO000000000OOOOOOOO000000KKKKKKKKKKKKKKKKKKKKXXXXXKKK0000
KKKKXXXXXKKK0KKKKKK000OOOOOOOOOOOO00000000000OOOOkkkkkkkkkxl;'.......'';oxdooodxxkkkOOOOOOOOOkd:;c:,..    .''..::'.......'.........  .,::;o0000000000000000000000000000000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO000KKXXXKKKKKKK0000000000000KKKXXKKKXXXXKKXXXXXXXXXXXXXXXX
KKKKKKKKKK0000000000OOOOOOOOOOOOOOO00Okxxxddxdddxxxxxxxxxxxkkkxxxkkxo:'..,:cdkOOkxkkOOOOOOOOOxdl:::,'..   .l:.       .....'..........;cc:,l000000000000000000000000000000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO00OOOOOOOOOOOOO0KKXXXKXXXXXXXKKKKKK0000OOO000KKKKKXXXXXXXXXXXXXXXXXXXXXXX
000000000000000000OOOOOOOOOOOOOOOO00xl:;,clccclooxkkkkkkOOOOOOOkkkkl,,,,,,..;xxdkOOOOOOOOkkkkdolc;,'','.  ...           ..............;cc:lO0kO0OO000000000000000000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO0000000000OOOOOOO0KKXXXXXXXXXXXXXXKKKK00OOOOO00KKKKKKXXXXXXXXXXXXXXXXXXXXXX
OOOkkkkkOOOOOOOOOOOOkOOOOOOOOOOOOOOxc;'':c,....':ddodxkOOOkxxxxxkkkkl..  ...;oc:oO00000000Okkxol:;,''',,...                    ......',;:loxxdxOOOO000000000000000000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO000KKKKKKKK000000000KKXXXXXXXXXXXXXXXXKKKK00OOO00KKKKKKKKKKKKKXXXXXXXXXKKKKKK
kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkOOOkkd;';lc'.....:xdlloxOK0kkxc::;;coooc;'.  '::;:ok00000000Okkxxdlc:::cl;,;,'..                   ........',;:loodxxkkkkkkOOOOO00000000000000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO000000000KKKKKKKKKKKKK000000000KKKKXXXXXXXXXXXXXKK00KKkxkOOO0KK0KKKKKKKKKKKKKKK000000000
xxxxxxxxxxxxxkkkkkkkkkkkkkkOOOkxxxxc,coc,'....:xocldxO0X0k0Kx:'. .okkkkxl;'';;.;dkOOOkkOOOOkxxdolccclooc:ll;;,.';,'.....             .........',;clodddddddxxxxkkkkOOOO00000OxxO0000000OOOOOOOOOOOOOOO0000000000000000KKKKKKKKKKKKKKKKKK000000000000KKKKKKKKXXXXXXkl:::clc:cc:lxk00000KKK000KKK000OOOOOOOOOO
OOOOOOOOOO0000KKKKKKKKKKKKKK0xdxOxc;lxl,''''':xdodkOkxkkxkk0Ko...,lkkkxkkoll:,,lkkkkOxc:::::cccllllloodxxxoc,.,codolcc:;,......       ............',:llllooooddodddddxxxkkkOxldO0000000000000000OOO000000000000000000000KKKKKKKKKKK0000000000000000000000KKKKXXX0koc'.....;c,.'lxOO000KKK0000000OOOOOO0O0000
KKKKKKKKKKXXXXXXXXXXXXXXXXKOdloddoloxkdc:clclxkk0Ok0kldkkkxkkc...'lxxxxxkxdkxddoodxkkkxdoc:;;:,';clloddxxxxcc'.:oxxxxxxdol:;,;,'...............   ...',;;::ccllllooooddoddxxdddxkkkOOOkkk0000000OkO0000000000000000000000000KKKKK00000000000000000000000000KKKOkddol;,;cddllc;:okOOOO0KKK0000000OOOOOO000000
KKKKKKKKKXXXXXXXXXXXXXXXXOdodddddxxxxkkxxkkxxkOOkc:kOddxxkolo:'...lxdoooddkOkxl...cxkxxoccllllcccclloodxkOk:;l,'okkxxO00kddoooolcc:;:;'''.................',,;:c::ccccolloddddooodddxxddxkkOOOOOOkO00000KKKK000000000000000000000000000000000000000000000000Oxxxxolldxk000OkOOOOOOOOO0KK0000000OOOOOO0000000
KKKKKKKKKKXXXXXKXXXXXX0kdoooooddxxxkkOOOOOkkdoddlcdkkxdooc,';;'. .lkxxxxxxkkkd;...,dkxo'...:llcccccccldxxkkl,ll,cdxxddx0Oddl::coxkdl:;'''....''''''...........''',;;,;:::cllooollododddddddxxxxxxkkOOOO00KKKKKK000000000000000000000000000000000000000000OkxxxxolclkK00OOOO0000OOOOO0000000000OOOOOOO0000000
K0KKKKKKKKKKKKKKKXXX0dc:cccclloddxkkOOOOOOOdloooooddddddoc,;ccc;',okxdddxxkkxxo,.'lxxxl. ..;llllll:'..cxxxxl';o:cdoOkO0Oxddc,'..:cll;''......,;,,''...................''.,::clccccloloooooodddddddddxxdxkkOOOO000000000000000000000000000000000000000K0Okxdxdolc:ckKKKK00OOO000OOOO000000000OOOOOOOOO0000000
00000000KKKKKKKKKKKXx'......''',;;:ccllloxd;:ooooooooooooooooooooooodxxddxxxxxxxddxxxxd:..,cllllol,.. ,dxxxl,.c:.;ccodxOxodo::,.   .......,,,;co:'''......................',,;;,,;:::ccllllloooddoodooddddddddxxxkkOOOOO00000000000000000000000000000Oxddxdoc::::oOKKKKK00OOOOOOOO00000OOOOOOOOOOOOOOOOOOOOO
OOOOOO000000000000KK0o,.................':c',ooooooooooooooooooollooddddddxooxkkkkkddxddolllodoool:...cxxxxl,.':'.:l:clcc::lc:l:'','.... .:odoxko:,,,,''''..........................',',;;;::::lccccclllloodxkxddkkkxkkkkkkkOOOOOO00000000000000000kxdxxdlc:;;;:cx00000000OOOOOOOOOOOOOOOOOOOOOOkkkOOOOOOOOO
OOOO00OOO0000000000000k:.............'....'..;ccllooooooooooooooloodddddddxooxxxxkkoldxdolllooolooolcodxkkxl,',:c,col:;'.';lc';ooxx:...,' ,okOxlldxd:;;;;,'''................      ............''',',,,;;::cxkkdokOkO0O0OxxxxxxxkkkkOOOkkO000000Okdddxdl:;;;;;;ck00000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOO000000OO000000000koool:;;,'......,,.............'',;:ccloolcloooooooodxddddddddllooollllllllllllloddxxo:'',;ccodoc'.,cloc,:xkko;,;:ll;cooxxccdxoc:cc:;;;,'..........  ..'....',,,.  ....................',,';cllodxOxoooodddl:;;:cccccllloooc::ccc:;;,,,,;lk0000000OOO00000OOOOOOOOOOOOOOOOOOOO000000000
OOOOOOOOOOOOOOO0OOkxook0000Okxdl:,',,;:,.......... .'::,....'',;;:cccccclodloooooooooollllllllcccllodxkkkkdolc;.,OXKk;.'xNKOc.lNNKk:cxdddo:,:c:;okxllllllcc::;,,'...   .,cxO0OOOO000Oocldo:,.........................',;;;;;::cc,.       .;::cccllcc:;,,,,,,;oO000OOOOOOOOO000OOOOOOOOOOOOOOOOOOOO0000000000
OOOOOOOOOOOOOOOOOkdloOOOOOO00000Oxol:;;,'...........;clcclc,.....''',,,,:c::cccccclllcccccclcc;;:codkO000OOkOOkdok0Okl;ck0Okd,:xxxxlldxdoo:,cooodxdlloooolllc:;,'...':okKKKKKKKKKKKKKKKKKKK0OOkkxxdolccc::;,,'..........,,,,,,,'..       .:lloollllc:;,,,,,:dO0OOOOOOOOOOO000OOOOOOOOOOOOOOOOOOO000000000000
kkOOOOkkOOOOOOOOOOOOOOOOOOO000000000Okxdoc'.',,','   ....,:;............,;,;;;;;;;;;;;;;;::::,..';:lodxxxxxxxxo:,....'lxxxkxl,...''',;,'',::;;lxxdollooooolcc;,'';lx0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00Okkxd;   .,:::;;;;...       .....'',;;;;::;;;;lk0OOOOOOOOOOOO00OOOOOOOOOOOOOOOOOOO0000000000000
OOOOOOOOOOOOOOOOOOO0000000000000000000KKKKOkkkxdo,   .....'....'''.''..'','',,,,,,,''''''''''. ...',;:ccllllll,  .....;ooxO0l,'''.....';::colccclllllllllc:;;;ldOKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKx....,:::::;lxxoccll:,;;,...........',:oxkO0OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO0000000000000
OOOOOOO0OOO00000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKK0:   ... ..'.......',,,,;;,..',,...''''''''............''''','.......';:clxkdlc;;;;;,,,,;:cdxdoooolcccc:;:cox0KXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0kddoollcccoOKKKOx0X0xkKOookkxdolll;,oO0000000OOOOOOOOOOOOOOOOOOOOOOOOOOOO00OO000000000000
0000000000000000000KKKKKKK00KKKKKKKKKKKKKKKKKKKKKo        .''....''',,,,;::;..','''',,,,;,,,,''........................';:clllllcclllc::cccoxdollc:;;:cldOKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000KKKKKkx0KxkK0O000000KK0OO000KK0000000OOOOOOOOOOOOOOOOOOOOOOOOOOOOOO00000000000
00000000000000000000000000000000000KKKKKKKKKKKKKX0l,..   .;::;;:;;;,''...'''''',,,'..''''',,,;;;;,''''..................,,,,;;:ccclcccclllllllc:::coxOKKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkx0kx0kk0000000000000KK000000000000OOOOOOOOOOOOOOOOOOOOOOOOOOO0OOO0OO00O
00000000000000000000000000000000000000KKKK000KKKKXXK0c...;dolccccccc:;,,''.;xkxd:,:c:;,'.....'''''.....'''''....................'''',::;:;,,;,;cdk0XXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKkxkxkxkK00000000000KKKK000000000000000000000000000OOOOOOOOOOOOOOOOOOO00
00000000000000000000000000000000000000KKKKKKKXXXXXKXKc...:c:cdOOkxdol:;;,':kXXXKkdOXKK0Okxdc',,.....   ......'''''.......    ........;c'....,:xKXXXXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0kdxddOK0000000000KKKKKK000000000000000000000000000O00000OOOOO000000000
K00000000000000000000000000000000000000KKKKXXXXXXXX0c.       .lKXXXKK0Okxk0XXXXXXXXXXXXNNNNd.o0xxxdoooc;,;lxdoolc:;'.....'.........  .c;...,lkKXXXXKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0xlcx00000000000000000000K0000000000000000000000000000000OO00000000000
KK000000000000000000000000000000000000K00KKXXXXXXXXo.    .,,,..dXXXXKKKKXKXXXXXXXXXXX0dc:cl''ONXXXKkdlloxKXX0Oxdc::c;,',cxxxdoc;',:lc'...',,,,lOXXXXXXXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0KK0K0c,kK0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000KKKKK00000000000KKXXXXXXXXd.    .';c;'xXXXKKKKKKKKKKXXXXXXKd.      .dK0xocccodolllollodxk0XKOOOKXXXXXXKOdolc.  ......'cOXXXXXXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000KKkdkKKK00000000000000000000000000000000000000000000000000000000000000
00000000000000000000000KK0000000000000000KKXXXXXXXXKl.     ..'oKXXKKKKKKKKKKKKXXXXXx.        .'..,cllllodk0KXXXXXXXXXXXXXXXXXXXXXXX0;    .',...,xXKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000000000000000000000
000000000000000000000000KK00000000000000KKKXXXXXXXXXXOollooldOXXXXKKKKKKKKKKKKKKXXXl          .cxkO0KKXKKKKKKXXXXXXXXXXXKKKKKKKXXXXK;    .',;;';kXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000000000000000000000
000000000000000000000000KKKKKKKKK000000KKKKKKKKXXXXXXXXXXXXXXKKKKKKKKKKKKKKKKKKKKKXx.         .xXKKKKKKKKKKKKKKXXXXXXKKKKKKKKKKKKKKKo.  .',:c;,oKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000000KKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000000000000000
00000000000000000000000000KKKKKKKKKK0KKKKKKKKKKKKXXXXXXXXXXKKKKKKKKKKKKKKKKKKKKKKKKKo.        ;OKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0o. .....;dKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00KKKK00000KKKKKKKKKKKKKKKK0KKKKKKK00000000000000000000KK00000000000000000000000000000
00000000000000000000000000KKKKKKKKKKKKKKKK00KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKk:.    .cOKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0dlclox0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000KKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000KKKKKKKK0000000000000000000
00000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000KKKKKKKKKKKKKKKK0xddxOKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKXXXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000KKKKKKKKKKKKKKKKKK00KKK0000000000000000000000KKKKKKKKKKKK000000000000000000
00000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0KK00KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000KKKKKKKKKK00000000000KKK0000000000000000000000KKKKKKKKKKKK00000000000000000
0000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKK000KK0000K000000000000000000000000000000000KKKKKKKKKKKKKKKKKKK0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000KK00000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000KKKKKKK00000000000KK0K00000000000000000000000KKKKKKKKK000000000000000000
00000000000000KKKKKKKKKKKKKKK00000000000000000000000000000000000000000000000000000000KKKKKKKKK00000000KKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000KKKK000000000000000000000000000000000000000KKKKK0000000000000000000000
000000000000000KKKKKKKKKKK000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000000000000000000000000000KKKKK000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKK000000000000000000000000000000000000000000000000000000000000000000KKKK000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKK00000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKK000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000K0KKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000000000000000000000000000000000000000000000KKK00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000000000000000000000000000000000000000KKKKKKK00000000000000000000000KKK000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000000000KKKKKKK0000000000000000000000KKKKK000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000KKKKKKKK000000000000000000000000KKKKKK000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000000000000000000000000000KKKKKKKK00000000000000000000000KKKKKKKKK00000000000000000000000000000000000000000000000000000000000000000KKKK00000000000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000KKKKKKK00000000000KKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000000000000KKKK00000K00KKKKKKKKKKK00000000000000000000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000KKKKK000000000000KKKKKKKKKKKKKKKKKKKKKKK00000000000000000000000000000000000000000000000000KKK0KKKKKKKKKKKKKKKKKKK00000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000000000000000000000000000000000KKK00000000000KKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKK000000000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000000000000000000000000000000000000KKK00000000KKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000KK00000000K00000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKK000000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000000000000000000000000KKK00KKKKKKKKK0000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKK000000000
0000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00K000KKKKKKK0000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKK00000
00000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000000000000000000000000000000000000000000KKKKKK0KKK0KKKKKKKKKKKKKKK0000
000000000000000000000000000000000000000000000000000000000000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKK00
000000000000000000000000000000000000000000000000000KKKK000000000000000000000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000000000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0000000000000000000000000KKKKK00KKKKKKKKKKKKKKKKKKKK00

`;

const map = `
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWMMMMMMM
MMMMW0o:;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::::;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;::;:;;;;;:;cOWMMMMM
MMMMNx'  .''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''..''. .dWMMMMM
MMMMNx'.,x0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0dldd, .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00OO00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0Ox; .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0Okkkkxdddxxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK: .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0kdddxO00KKKK0OddO0KXXXXKK0KK0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdxkOOKKXXXXXXXXXKOxddkkkxxdxkkxdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0kodOKXXXXXXXXXXXXXXXXK0xddddkOKKKKkddk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxodkO0KXXXXXXXXXXXXXXXXXXXXXKKXXXXXXXXKOdoxO0KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdxxO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOkxkkxxxk0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0KKXXXXKKKKKXXXKK0KKKXXXXXKKKKXXXXXKKKXXXXKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kddk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkxddodkO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkl:;:oOKKOo:;:ok0Oo:;;:lx0KOo:;:lkKXXOocd0XX0dc;cdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKXXXXXXXXXXXXXXXXX0xdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOkxdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0d;,;:;;oOkc,;:;',dd;.';,.,dd;';c;;lOKOl..,d0Kd,',,,o0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK000000KKKXXXXXXXXXXK0OxdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kddxkOO000000000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .dWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOc:dOxc:lxo;l0X0o;lo;..'.'cd:'ckkl:cxOl'',';kKxc;,,;o0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK000000000KXXKKK0000KKKXXXK0kdxOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOkkxxxxxxddx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0o;:lc'.:dd:;odo;,od;';c,;okl,,ll,.'co,.,;''lkxl:;'.;xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0000KKKKKKKXXXXXXXKKKK00000OxdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKK0OxdooxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0x, .dWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOo;''';d00d:''';oOklcx0d;;dkd:,'';ldl:ckkdlcdxc,'',oOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KKXXXXXXXXXXXXXXXXXXXXK0kdoxO0KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kdddxk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdl' .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkO0KXXK0OkO0KXK00KKK0O0KK0OkO0KK00KXXK00KK0OkO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KXXXXXXXXXXXXXXXXXXXK0kdxkO0KKKKK000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0Ok0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOddkO: .dWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KKXXXXXXXXXXXXXXXXKOdlox0KXXXXXXXKK000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxdddxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxdxOXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxddxO00KKXXXXXXXXXKOddold0XXXXXXXXXXXXKK000KKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kddkKK0xoxOOOO000000KXXXXXXXXXXXXXXXXXXXXXXKKKXXXXXXXXK0kdxOKXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxldO0Okkkxddk0KKKK0kdxOKKkod0XXXXXXXXXXXXXKKKK0000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOddk0KXXXKOkxxdxkkkkkxdxkkkO0KXXXXXXXXXXXXKOxxdxOKXXXXX0kddkKXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0dcdKNNNNX0OxddoooodxOKNWNXOdxO0KXXXXXXXXXXXXXXXXXXK0KKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kdodxO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOdkKXXXXXXXXXXXXXXXXX0kdoddoodk0XXXXXXXXKOdodxxdodk00OxodkKXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdoodkKNNWWNXKKK0KKNNWWNWWNXOdok0XXXXXXXXXXXXXXXXXKKK000000KKXXXXKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkxdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOdkKXXXXXXXXXXXXXXXXXXXK0KK0Okxdxk00000kdodOKXXK0OkOOOkO0KXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kxkOOkxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxkO0KKXXXXXXXXXXXXXXXXXK0kdddx0XNNNWWWWWWWWNWWWWWN0dokKXXXXXXXXXXXXXXXXXXXXKKKKK00KKKKKKKKKKK00KK00KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxxxxkOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxddOKXXXXXXXXXXXXXXXXXXXXXXXXXX0kddxkkkxdxOKXXXXXXXKKXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXKK0000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkod0XK0OxdxOKXXXXXXKK0OOOO00KXXXXXXXXXXXXXKKKKXXXXXKOxdxkxdodxO000K0000000000000000Oxld0NNNWWWWWWNWWWNWWN0ddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKKKKKK000K0000000000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OxddxO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kdxOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xK0kxxxkkOOOkxxk0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxoxXWWWNX0kxxk0KXX0kxxkkkkkxxOKXXXXXXXXXKOkkkOKXXXKkox0XNNXK0OkOOOOOOOOOOOO00OOOOOOOkkOKNWNWWWWWWWWWWWWWN0ddOKXXXXK000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKK00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkkkxxxO0KXXXXXXXXXXXXXXXXXXXXXXXXX0kxxddddxxxdddxxxO0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxlx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.'lxdddxk0KXXX0OxddxkO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOOOOO000000Okdx0NWNWWWNNXOxdxkkxxOXNNNNNKkxxkO00000OOkxk0kdO0K0kdxKNNWWWWNNNNNNXXNNNNNNNWWWNWWWWWNNXNNWWWWWWWWWWWWWWWWXOxdxkOOkkxddxxkO0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxdxxkOO00KXXXXXXXXXXXXXXXXX0kddxkkxxxxxxxxkkxdddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxlx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,d00KKXXXXXXXXXXK00kddkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxddxO0K0kdddddddxOKXNWWWWNNWWWNXXKXXXXNWWNWWWWNXKkdooooodxOKNN0xodddxOXNNNWNWWWNWWWWWWWWWWWWWNWWWWWWNWNXKXNWWWWWWWWWWWWWWWWNNXXKXXXXKXXXKKOddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00OkxdddxkO0KKKXXXXXXKKOxddk0KXXXXXXXXXXXXXK0xdk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxox0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXK0kdx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkxxxxxxxxxxxxkkkkxkkkOXNNNNNNNXXKKXXNNNNWWWWWWWWWWWWWWWWWWWNWWWWWNWWWNNXXXXXXNNWWNNXK00KXNWNNNNWWWWWWWNNWWWWWWWWWWWWWNNXXXXXXNNWWWWWWWWWWWWWWWWWWWWWWNWWWNWWNWNKOxdk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOkddxkkOOOOOOOOkkxxk0KXXXXXXXXXXXXXXXXX0kdxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkodOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXKkld0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxxkkkkkkkkkkkkkxxxk0KXNNNWWWWWWWWWWWWWNNNWWNWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWNWWWNWWNWWWWWWWWWWWNWNNWWWWWWWWWNWWWWWWWWWWNNXXXXXNNNNWNWWWWWWWWWWWWWWWWNWWWWNNWNNWWWWNWNKOxxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00000000000KXXXXXXXXXXXXXXXXXXXXXXXKOxdx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xoxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXKkodOKXXXK0kxdxxk0KKXXXXXXXXXXXXXXXXXXXXXXXXKkxk0XNNNNNNNNNNNNNNNNNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWNNWWWWWNNNXKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWNXOod0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0000KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkod0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXKkooOK0OkkxxxxxxxxxkkOOOOOOOOOO00KKXXXKKK0OOxxOXNNWWNNWWNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWNNNNXXXXXXXNWWWWNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXdoOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0000KKKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxdxO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXKx::odddx0KXNNWNNXXKKK0OxxxxkxxdoddxxxxxxddxkKXNNWNNNWWNNWWNWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNXKXXNNNNNNWWWWWWWWNNWWWWWWWWWWWWWWWWWWWNNX0OOOOOO0000000xld0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKK0000000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kddk0XXXXXXXXXXXXXXXXXXXXXKK00KKXKOddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXX0xldkkk0XNNWWWNNNWWWNNNNNNNNNNNNXKOkxxkkO0KXNWWWNNWNNWWWNWWWWWWWWNWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNXXXXXNNNNNWWNNWWNNWWWWNWWNNWWWNNWWWWWWWNNNKkdxddddddxxxxxxxxk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxxxxxxxkkO0XXXXXXXXXKOkkkxkkkxdodOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXKOxOKXNNNNNNNNNXXXXXXNNNNWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNNNNNXXXKKXNNNNWWWWWWWWWWNNWWWNNWWNNWWNNNNXKKKXNXK0koxKXXXXXKKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kkkkxxdoxOKXXXXXXKkodk0KK00OkO0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXX0xdkXXXKKKKKKKKXXXXXKKKXNNWNWWNNNNWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXKKKXXKKXNNNNNWWNWWWWWWWWWWWWWWWWWWNWWNWNNNKkdxxdddddxO0KXXXXKOxdx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK000000000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKOxdk0XXXXX0ooOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXKOooONWNXXKXXXNNWWWNNXKKKXXXXNNXXXNNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXXXXNNXXXNNNNWNNNNNWWWWWWWWWWWWWWWWWWWNNNWWN0ddkKK0kxkO0OkOKKXKkoooco0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00KK000000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdxOKKXXOod0KKKKKKKKK000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXKOloKWWWWWWWWNWWWNNNWNNXXKK00000000KKKXXXXNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKXNNWWWWWWWWNNNWWWWWWWWWWWWWWWWWWWWWWWNWWWWXxlx0XXXXXKxoddddk0kdokKkodk0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0OO0KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xddkOOkxk00OOOOOO0000kk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXX0oo0NWWWWWWNNWWNWWWWWWWNNNNNNNNNNNXXXXXXXKKKKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWNXKKXNWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWNNWWNWN0xdkKXXXXOll0XKOOOOO0XNNKOkxxx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOOO00000O00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kddxxkO00000KKKKKKKKOk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXKxdOXNNNNWWNNNNWWWWWWWWWWWWWWNNNWWWWWNWWNNXX00KNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNNNWWWWWWWWWWWNWWWWWWWWWWWWWNNXKKNNWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWNXOdxO0OOxokXWWWWWWNWWWWWNNXOddOKXXXXXXXXXXXXXXXXXXXXK0000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO00KK00OO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOOO00KKKKKKKKKKKKKKKK0O0KXXKKKXXKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXX0kddxxxk0XNWNNNNWWWWWWWWWWWWNNWWWWNNWWNNNNXK0XNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNNNWWWWWWWWWWWNWWWWWWWWWWWWWNNNXXXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNK0OkxxOKNNWWWWWWWWWWWWWWWNKkxOKXKKOkkkO0KXXXXXXX0kdddddx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00OOO000OOOOO0000000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOO0KKKKKKKKKKKKKKKKK0OO00kk0KKO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXKOxxxxddk00KKKKXNWWWWWWWWWWWWWWWNNWWNNXK0KKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWNNWNNXXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWNWWWWWNNWNNNNNWNNWNNWWWWWWWWNWNNXKkxkOkdddxxxdxkk0KKK0OxxO0KKOod0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00O00000OOOOOOOOOO00KKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00OO0KKKKKKKKKKKKKKKK0OOkxk00OkO0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0Okxddoox0NNWNNWWWWWWWWNWNNWWWNKKXNNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXXNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOddxkOxooxKNNNXK0xdddddxOXNWWWXxd0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OOOOOOO0OOOO0000OOO00KKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KKKKKKKKKKKKKKKKK00OOOkkO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKOxxOXWNNWWWWWWWWNNWWWNWNXKKNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNN0llOKK0ooxOXWWWWWNNK000XNNWNWWWXkxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK000000000OOKKKKK000000OOOO00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOO0KKKKKKKKKKKKKKKKKKKKKK000OO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxox0XNWWWWWWWWWWNNWWWWNX00XNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKXNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXkdxOOxokKXNWNWWWNWWNWWWWWWWNWNKkkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOO000KKKKKKKK00000OO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOO0KKKKKKKKKKKKKKKKKKKKKKKK00OOO0KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxdkKNNNWWWWWWWNWWWNNNNKOKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNKKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXK00KXNNWWNWWWWWWNWWWNWWNWWWXkxk0KKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00OOO00KKKKKKKKKKK0000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0KKKKKKKKKKKKKKKKKKKKKKKKKKKK000OOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxxx0NWWNWWWWWWWNWNXK0KXWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWNXXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNKOOO0OkxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0000000000KKKKKK0O00000KKXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKKXXKKK0OO0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00OO00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOddKNWWNWWWWNWWNXKKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXXXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWNNWNNNXNXKOdx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OOOOOO0000OO00KKK000KKXXXXXXXXXXXXXXXXXXKK0OOOOOOOO00OOOOO0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00OO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0XWWWWWWWWNNX00XNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNXKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNWWWWWWWWWWWWWWWWWWWWWNWWWWNNWWWNWWNWN0dokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK000000KXXXXXKK0000KKXXXXXXXXXXXXXKK0OO0KKKKK00OOOOOOO00KKKKK0OOO00KKKKKKKKKKKKKKKKKKKKKKKKKKK00O00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0XNNWWWNWWNXKKXNNWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNNKkdk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0000KKKKKKKKKKK00OOO0K00000OOOO00000OOOOOOOO000OOOOOO000KKKKKKKKKKKKKKKKKKKKKKK0OO00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOXWNWWWNNXK0KNNWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXKXNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNX0dokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKKKKKKKKKKK0OOOO000KKKKKKXXXXKKKKKKKKXXXKKKKKKK0OOOOOOOO00KKKKKKKKKKKKKKKKK0OOO0KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOXWWWNWWNKOKNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNXKXNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNKkdxOKKKK00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0000000000O00KKKKKKKKKKKKKK000000000000KKXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOOXWWNWNWNK0KNWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXXXNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWNKkodxxdoodOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKK0OOO00KKKKKKKKKKKKKKKKKKKK00OOO0KKKXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkxKWWWWWWNX0KXNWWWWNWWWWWWWWWWWWWWWWNWWWWNNWWWWWWWWWWWWWWWWWWWWWNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNNWWWNWWNXXXNNNNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNK0O0KKxlxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0000OO00KKKKKKKKKKKKKKKKKKK000OO0KKXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdxKNWNWWNNK0KNWWWWNNNNNWWNNWNNWWWWNWWWNNNXNNNWWWWWWWWWWWWWWNNNXXXXXNNWWWWWWWWWWWWWWWWWWWWWWWWWWNNWNWWNWWNNXXXXXNNXNNNNNWWWWWNNWWNNWWWWWWNNNNNWWWWNNWWWWNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNOoxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00O00000KKKKKKKKKKKKKKKKKK0OO00KXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkoxKNWNWWNX0KNNWNWNNNNNNNNNNWWWNNNWNNWWNNXKXXNNXXXXXXXXXXXXXXKKXXXKXXNNWWWWWNNNNNNNXXXXXXNNNWWWNNNNXNNNWNKkdOKXXkdOXNNNNNNNNNNNNNNNNNNNNX0O0NNNNNNNNNNNNNNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNWNOoxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKK0OOO00KKKKKKKKKKKKKKKKKK0OOOKKXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxx0NNNNWNXKKXNNWWWNNWWNWNNX0kxxk0XNNNWWNXXXXXXXXXXXXXXXXXXXNNXKXNXXXXXNNNNXXXXXXXXXXXXXXXXXNNNKdc;;cxXNXxclOK0xoxxddk00dodx0X0kdddOKkxdooxOxood00xddx00kdk0NWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWNKxokXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK000OO0KKKKKKKKKKKKKKKK00OOO00KKXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOddkXNWNWNNK0KNNK0kO0XNWNXxlodxdx0XKXNNXKKKXXKXK0OOOOOO0XX0OOOOKNWNNXXKKKKXXXNNNNNWWWWNNNXXKKKd.    ,kKX0xoxOxxkdooooxxcoxdk0kddo:ldldkdok0koldxolxkdddldOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWXkdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OO00KKKKKOOOOOOOOOOOOOOOO0KXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kdkXWWWWNNXK0x:...'l0NN0xkKXOxdO0kOK0xxxx00xkxloolcoddOkloxxx0NWWWNNNNNNNNNWWWWWWWWWWWWNNNNXx'    ,x0XNXOdookkclolldxlx0kOklldl;ldldOxdxxodOKOolxOddookKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWNNXkx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OO000Ok0KKKKKKKKOkO0KKKKXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdkKNWWWWWNOc.    'xXN0dx0Kkl:d00xoodxdoOOoxdlk0kdO0xOxlkKOx0NWWWWWWWWWWWWWWWWWWWWWWWNWWWWNXkl::lkKNNWNXOxOX0xoddxOOk0X0K0xddook0kdddxxdooxk0OddddOOk0XNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNX0OkkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00OOO0KXXXXXXXXKKKXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxlxXNWNWWWXk;. .'l0NNXkolloclkXKd;cOKxllllxxokKOxO0kOkoOKOx0NWNWWWWWWWWWWWWWWWWWWNWWWWWWNNWNNXXNNWWNNWNNNNWNNXXXNNNNNNNNNNXXXXNNNXXXNNXXXXXNNNXXNNNNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNXKOxdddk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdONWWWWNX0kxxk0XNWWNNKOxxk0XXOooOXNXOkk0KK0XNXKXXKXK0XNXKXWWNWWWWWWWWWWWWWWWWWWWWWWWNNNNWWWWWWWWWWWWWWWWWWNWWWNWWWWWWWWWWWWNWWWWWWWWWNWWWWNWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNWWWNNNXK0OkkkkkkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xkNWWWNXK0XNWWWWWWWWWWWWWWWWNK0KNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNWWWWNNX000Okxdxk0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xkNWWNXKKXNNNWWWWWWWWWWWWWWNNNNWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNKkddkO00KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdONWNK0KNNWWWWWWWWWWWWWWWWNWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNKOxxk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkoxKNNK0KNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNXkdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxcxXXKKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOddk00XNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXkoxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdd0XNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXkokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxxOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xx0XNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXkkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdkXWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNNWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNOxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxdONWWWWWWNWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWNNNNNNNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXxokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdokXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNWWNNWWNKO00000KXNNNNNWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNKxoxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK000KXK00O00000000000KXK00000KKK000000KKKKKXK000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kdx0NNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWNNWWWWWWWWWWWWWWWWNNWWWWNNXOO0K000000000KXXNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXkdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOl,:x0Odc,';cll::c:;:xOdc:c::lxxc,;c::xkddOKkc,:xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdokXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWNNNNNNNNNNNNNNNNNNNNWWWWWWN0O0KKKKKKKK000O0KXNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWNNWWNNOddxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOo;'';xK0x;.:kkl;:lc''lc,:dOx:';c'.;l;,ldclkkc'''ckKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOddkKNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNNXKKKKKKKK00KKKKKKKKXNNNNWNNK00KKKKKKKKKKK0000XNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWNWWWNNXKOxodOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0l'.'..l0KO:.l0Ol;;;',lxc'cOK0l,;c'.,cldOxllxo'.'..:OKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xodOXNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWNNWNNWWWWWWWWWWNNWWWNNWWWWWWWWWNNK0KXXXXXXXXXNNNNNXXKKKKXXXXXX0OOO0KKKKKKKKKKK00KXXNNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXOdxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKx;.';,,:x0Oc'l0Oocdxc,:xdc;col;;lo,'o0KXKklllc,,;,.,d0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkx0XNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNWNNNNWWWNNNWWNNNWWWWWWNWNNNNNWNWWNWWNNWWWWNWWX0KNWWWWWWWWWWWWWWNNNNNNNXXXXKK0kk0KKKKKKKKKKKKK00000KXXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxx0K0Oxk0KkdkKKOk0K0xdk00xoooxO0OddOKXXX0kkxxk0K0kxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kdod0NNWWNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWX0k0NW0xkXNNNNNNNNNNNNNNNNNNNKOx0NNNNNWNNNNNNWNNWWXKKNNWWWWWWWWNWWWWWWWWWNNWWNNXK0O0KKKKKKKKKKKKKKKKK000000KXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWXOxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOxl:cd0NWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXkodO0d:oOOkO00Oxxk00kxddO0Oxdlcx0Oxxk00xxxxOXNWWNK0KNWWWWWWWWWWWWWWWNWWWWWNNX0000KKKKKKKKKKKKKKKKKKKKKKKK00O0XNWWWWWWWWWWWWWWWWWWWWWWWWWWNKkox0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKkddoookKNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWXxlcdxc,oxook0kdl;;oOkocoxoldxl:dOxl,,oo;ldolkNNX0OOOKXNNWWWWWWWWWWWWWWWNWWNKOO0KKKKKKKKKKKKKKKKKKKKKKKKKKKKK00KNNNWWWNWNWWWNWWNWWWWWWWWWNWNX0OxxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxxxk0KKKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWXkoxKXx:oxox0Ol::,'cdlcokkocddc:cl::'.ll:xKklkXXOo;'.':kNNNWWWWWWWWWWWWWWWWNK000000KK0KKKKKKKKKKKKKKKKKKKKKKKK000KKNNWWWWNWWWWWWNNWWWWWWNNWWWWNKxdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdokKXNNNWWNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWX0k0NW0dkOkOK0dlcllllcclokOdolooxdlcclxxdOX0xOK0x;.   .lXNWWNWWWWWWWWWWWWWWWNNXXX0OOO0000KKKKKKKKKKKKKKKKKKKKKKK0000KXNNWWNNWWNNNNWWWWWWWWWWWNWNXOxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkloOXNWWNNWWNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNWNNNNNNNNNXXXXXXXKXXXNNXXXNNNXXXXXXKKXK00KKKx:...;kNWWWWWWWWWWWWWWWWWWWNWWWNNXXXNX000KKKKKKKKKKKKKKKKKKKKKKKKK0000XNNNNNXK00KXXNNNWWWWWWNWWNXxd0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkod0XNNWNWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWNXXKKKKKKKXNNNNK0OOKNNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWNXK00KKKKKKKKKKKKKKKKKKKKKKKKKK0OOKNWNX0OO0000KKXNWWWWWWWNWXkdx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOOkkOKNWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNWWWWWWWNNXKKKXNNNNNWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNK0O00KKKKKKKKKKKKKKKKKKKKKKK0O0XNNXKOOKKKK000XNNNWWNWWWNXOodkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0XNNWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWNNXKKKXNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKKK00KKKKKKKKKKKKKKKKKKKKK000K00000KKKKKK00KNNWNNNWWWWNKOxxkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kOKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNKKXNNNWNWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWNNNNK00KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000XNNWWNWNNWWNX0xdxO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xkKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWNXXXNWWNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWNWWWX00KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000KXNWWWNWWNWWNNKOkxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOdxKNWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNX00KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00XNNWWWNNNWWWWNXOxxxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdONWWWNWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNK0O00KKK0000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKOOXNWWNNNWWWWWNWNNKOdoxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKXXXXXXKKKKKKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxOXNWWNWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXKK000KKK000KKKKKKKKKKKKKKKKKKKKKKKKKKKKK0O0KXNWWWWWWWWWWNNNNX0kxxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00O00000000000000000000000000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kkKNNWWNWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXXXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNNNNNNNNNNNK00KKKKKK00KKKKKKKKKKKK00KKKKKKKK000KKXXXXNNNNWWNNWWNNKkdxkOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO00000000000KKKKKKKKKKK00OOOOO00000KKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xkKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNXXNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNX00KKKKKOxkOKKKKKK0KKKOkk0KKKKKKKKKKKKKK000KXNWWNNWWWWWNXK0Oxddk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0KXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKK00OOOOO00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdkXNWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWNWWNKKNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWNNX00KKKKKkxk0KKK0OOkkOOkdxkOOOOkkkO0KKKKKKK000KXNNWWWWWWWWWWNXKOxxkkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKK00OOO00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kkOKNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNX0KNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWNXK0KKKKK0kxOKKK0OkxxdkkxddxOOkdxxxxOKKKKKKKKK000KXNNNWWWWWWWWWWNNX0kddk0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OOO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkOXNNNWWNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNK0KNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWN0O0KKKKK0kxkkOOOkxxxxkkxxkxkOkxxkkO0KKKKKKKKKKKK00KXNNWWWWWNNWWWNWNNKOkkxxkOO0KXXXXXXXXXXXXXXXXXXXXXXXX0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OOO00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kkOXNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWNX0KXNWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWN0O0KKKKK0OOOOOO00OOOO00O00000K0OOO0KKKKKKKKKKKKKK000XNNWWNNWWWWWWWWWNNNNKOxddxkO0KXXXXXXXXXXXXXXXXXXXXKOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdkXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNK0XNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWNXK0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK0O0XNNWWWWWWWWWWNNNNNWNNXXKOxdOXXXXXXXXXXXXXXXXXXX0OO0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00OOOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0OkO0KXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKNWWNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNK00KKKK0000KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000KNWWNWWWWWWWWNNWWWWWWWWNKkdk0KXXXXKOkk0KXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOO00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkOKNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWNNNXKKNNWWNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOOKK00OkkkkO0KK0KKKKKKKKKKKKK0KKKK0000KKKKKKKKKKKKKKKK00KNWNWWWWWWWWWWWWWWWNWWWNXkddkOOkxddxddkKXXK0OOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00OO0KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kkKNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNWWWNK0KXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWXOOKK0OkxxkO00OkkkkOOkOOOkO0OkkkOOkkkkkO0KKKKKKKKKKKKKK0O0XWWWWWWWWWWWWWWWWWWWWWWWNK000000KXXXOddk00O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK000OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkx0NNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXKKXNNWWWNNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWN0O0K00OkxxxOOxxkkxkkxxxxkOOkkxdxkxxkOxk0KKKKKKKKKKKKKKKOOXWWWWWWWWWWWWWWWWWWWNWWNWWWNNNNNWWNNX0xodxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kxOKNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXXXK0KNNWWWNNNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOO00OkkOOkxOOkxxkk0OkxxO0OkxxxdkkxkOkxk0KKKKKKKKKKKKKKKOOXWNWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWNNWNN0xld0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0Ok0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdxKNNWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWNWWNWWWWWWWNWWWWNWWWNWNWWWWWWWWWWNNWNWWNWWN0ddkKXNWWWWNWWNNNWWNNNWWWWWWWWNNWWNNNWWNNWWWWWNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWN0O0K0OOOOO0KK0OOO00K0OOKK0OOOOOOOO00OO0KKKKKKKKKKKKKKKKOOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNWWWN0ol0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkOXNNWWNWWWWWWWNNNNNNNXXXXXNNNNNWWWWWWWWWNNNWWWWWWWNNNWWWWWWNNNNWWWWNWWNWWWWWWWWWNWWNWWWWWWWNNNNNNNXd'.lKNNNNNNWNKOOKNN00XNNNNWNNNNNNNNNNNNNNNNNNNNNNNWNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNK0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKOOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWXOod0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kk0NNWNWWWWWWWNNNWNN0ddkOO0XKKNNNNNNNNNNNKXNNNXNNXK0KNNNNNNXKXNNNNNNWWWWNNNNNNWWNNWWNWWWNWWNNKkddol'  .coddk0XNNXkoxOkxk0OkxOXKOxO00OxkKK0KNXKKKOxxkKX0kxk0XNWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNK00KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKOOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNN0ddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kk0XNWWWWWWWWWNNWNXOld0KKXKkk0Oxddxxdd0K00XOdlokkocdOxodOK0kOxolod0NNWNKklcoOXNWNNWWWWWNNWNN0d;.        .;d0NNWNN0dcckOdc:clkk:cdxl:clxkxxO0kOOdlcckOoclodONWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNKO0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00KNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNN0xkXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdOXNWWWWWWWWNNWNXOloO00K0ookddxolodcdOxk0xl;;oxdokkc,:d0xldl:oolxKNNKo.   ,xXNWWWWWWWWWWWNX0ko;.    .;d0NWWNNWWXxlxKOc:oxxOx:d0kccxxk00xllxOxldolxkox00dONWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKOO0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00O000000000KXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNKkk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,d00000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O000kk0XNWWWWWWWWWNWNNOccxxxOOookxOKkdkOodOxkkc;::okkdxOo:,cOxldllO0dd0WN0c.   .dXNWWWWWWWWWNNXKKXO:. ....:ONWWWWWWWNOx0XKkddkkKOdkXKxdkk0XXOloOKkoddoO0kOXKO0NWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNK0000KKKKKKKKKKKKKKKKK000KKKKK000KK0000KXXK0000KXNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNkdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKK000OO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kkOKXXXNNNWWWWWWWWWWNWWN0dloooxkloO0KX0OKKOOK000xoodk00xkOxddkK0kOkkKK00XWWN0o,';dKNWNWWWWWWWNXKKXNXx;,lOOo,,dXNWNWWWWNNXNNWNXXXXNNXNNNNXXXNNNNXXNNNXKKXNNXNNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNNXK000KKKKKKKKKKKKK000KXNNNNXXK00000KNNWWNNNNNNNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXxoOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXKK00000KKXXXXXXXXXXXXXXKKKKKKKKXXXK0OxkKNWWWWWWWNWWWWWWWNNWWWNNNXXXNX0xOXNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNWWWNXKKKNNWWWWNWWNNXKKXNNNN0k0XNWN0kOXNWWWNNWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWNWWWWNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKKKKKKKKKKKKKKKXNNWWWWWWWNNXXNNNNNWWNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWXxoOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOO0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXKK000O0000KKKKKKKK000000000000000OxxOXNNWWWWWWWWWWWWWWNWWNWWNNWWWWNNNNWWNWWWWWWWNNNNWWWWNWWWWWWWWWWWWNWWWWWWWWWWNNWWWWWWNWWNNNXK0KNNNWWNNNNWWWNNNNNNWWWNWWNNWWNWWWWWWWWWWWWWWWWWWWWNWWWWWWWNWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNNNNNNNNNNNNNWWWWWWWWWWWWWWWNNNWWWWWWNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWNNX0doOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXKKK0000OOOO000KKKKKKKKKKKKKKK0kxxOKXXNWWWWNNWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNK0kxdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXKKKKKKXXXXXXXXXXXXXXXXXXKOxxxkkkO0KXNNWNWWNNWNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKKNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWN0kxdxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OkdddxO0KKXXNNNWWWNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKXNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNKdoOKXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OOOOkkxxkO0XNNWWWWWWWWNNWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWNWWWNXKXNWWNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWNOoo0XXXXXXXXXXXXXXXXXXXXXXXXXXX0xokXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OxdxkOOKXNNNWWWWWWWNNNNWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWNWWNNWNWWWNXKKKXXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWNWWWWWNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWNN0oo0XXXXXXXXXXXXXXXXXXXXXXXXXXXOl;xXXXK0kxxxkkxkkkdkOkkkxxxxOOkddO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00Okxxk0XNNNNWWWWNNNWWWWWWWWWNNWWNNNNNWWWWWWNNNNNNNNXXXKK00KXNNWWWNNNNXXK0KXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWNWWWWWWWWWWWNWWWWWWWWWWWWWNKol0XXXXXXXXXXXXXXXXXXXXXXXXXXKOl;xXXXOl;lo:;::;,'.,;,;,';;;:l:.:k0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkxxkOKNNWWWWWNWWWWWWWWWWNNKOkkk0XNWWNX0OkkkkkkkkOOOOkxdk0XXNNNWWWNNXKKKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNWWWNNNNXXXXXXXXXXXNNNNNNNNNNNWWWNNNXkox0XXXXXXXXXXXXXXXXXXXXXXXXXXKOl,cdxxd:,co;,co;.';,.':;.,;:cl;.l0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOxdxk0KKKKKKKXXXXNNNXK0kxxxxddk0KK0kxxkkkxxk0KXXXXK0xddxxkO0KXNNWWNK0KNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXXK0OkxdddddddddddddxxxxxxxxkO0KKKKKOdk0XXXXXXXXXXXXXXXXXXXXXXXXXXXK0o,'',:odc:::oOOd:lxo:lkxc:;cdxc;o0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOOkkkkkxxxxxxxxxkOO0KXXK0OkkkOO0KXXXKKXXXXXXXXXKK000OOkxdxOKNNK0KNWNNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNKOxxOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOOO0K0OO0KXKK00KK0KKKKOO0KK0O0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKKKK0OkkO0KXXXXXXXXXKKKXXXXXXXXXXXXXXXXXXXXXXXXXKKOkxxxkkkKNWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXkdk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OxddkKXNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNKkkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxokKKKKKXXKKKKKKXXXKKKKKXXKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0Oxxxk0KXNNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXkddkOOOOkOO00KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0l,oOxoloxOkollldO0kolooxOkollx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxddx0XNNWWWNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNNNNNWWNNNNNNNNNNNNNNNWNNNNNWWNNNNNNNNNNNNWWNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXOxddddooddddddxkO0000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0Ol,oxoc;',oc'';,'cl,,c;':xoc;';xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OxdOKNNWNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWXOOXNNWXkkOkdx0XKkdkKNNKxx0NWXOxdddx0XKOKNNNKxdONWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNXK000OO000K00000Oxdxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0dcl:,odc::''lc'cd:.;:';dl,:l:cc,;dKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kddOKNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW0ccONWN0;,l,.'l0k,.,xX0l,.cKN0o,;c:';xdlxKX0x,.c0NWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNWWNWWNNNNNXKKKXNNNNNNXKkxdx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xc:coOkollccxdldkdcodc:l:':dloolokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0O0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kdxOXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW0ccONWN0;,c,.';oo,.'d0l,:',xX0l,,:;.:xdcdKOol:::o0NWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWNNXKKXNWWWWWNKxlkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKXKKKKKKKKKKKKKKOl:;;;d0KKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxx0NWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW0::xKKXO;,c,.,,',;.'ll'.,'.:O0l;::..oOdcdkl'',;..lKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXK0XNNWNWWN0xk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xkXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWKo:clldxccoc:ll;:dc:o::oxxocxOxoO0d:lkxdxdc:cdxo:ckNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNX0KNNWWNWNN0kOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkx0XNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNXK000KXKKXKKXXKKXKKKKKNWWNXXXXXNNNKKXXXXKKKXNWNKKXNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNK0XNWWNWNN0dxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdokKNWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXKXNWWWNNNKxox0KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xox0XNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXKXNWNWWWNWNXkodk00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xokKNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWNNWNK0KNNWWWNNWWWNKkddkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkodOKXNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWNNXKKXNWWWWWWNNNXKKK0xdx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xodddOXNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXK0KXNWWWWWWNXKKKXNNNX0xdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00OxdOXNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWNKKXNNNNWWWNXKKKXNNNWWNNX0kxxk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdxO0KKXXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXKXNWWWWWWNXKKXNWNWWWNWWWNNKkddkOO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKXKK0OkxddddOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNK0KXWWWWWWWNKKNNWWWWWWWWWNWWNNXK0OkddxkOOOOO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxdxOKXXKK0kolkXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWNNXKKKXNNNWWWNNXKKXNNNWNWWWWWWWNNWWWWNNNKOkkOOOOkxxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0kddxkxdx0XXXXKOdld0XNWNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWNNNWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWNNK0KXNNWWWWWWNK0KXNWWWWWWWWWWWWWWWWWWWWWWWNNNNNNNKxox0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxdxkO0KXKOddOKXXXXKkllkXNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNWWWWWWWNNNNNNNWWNNNNNNNNNNNWWWNWWWWWWWWWWWWWWWWWWWWWNXKXNWWWWNWWWWNK0KNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXOxx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0Oxdxk0KXXXXXKOddOKXXXXKOolx0XNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWNNNNXXXXXXXXNNXXXXXKKXXXXNNNWWWWWWWWWWWWWWWWWWNNWNNKKXNNNWWWNWWWWNNK0KNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNOxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kddxO0KXXXXXXXXXK0xdxO00KKK0xlld0XNNWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNNNNNNNXXKKKKKXXXXXKK0KKXXNXNNXXK0KXNNWWWWWNWWWNNWWWWWWWNNKKXNNWWWWWWWWWWWNNXKXNWWWWNNWWWWWWWWWWWWWWWWWWWWWWNNWNKxdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kxdxkOKXXXXXXXXXXXXXXKOxkkOkxdxkkxdodOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKKXXXXXXXXXNNNNNNWNNNNNNWWWWWWNNNXKKKKNNWWWWWWWWWWWWNWNNXKKXNWWWWWWWWWWWWWWWNKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNN0ddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdxOKXXXXXXXXXXXXXXXXXXXXKKKK0OxdxO0xllxKNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWX0KXNNNNNNNWWWWWNNNWWWWWWWWWWNWWWWWWNNXKKXNNNNWWWNWWWNNNXK0KNNWWWWWWWWWWWWWWWWNXKKNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNKkdk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdok0OxloOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNNXXKKKXNNNNNXKKKKKXNNWWWWWWWWWWWNWWNWWWNNK0KNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNX0xdx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdk00xclONWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWNWNXKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNWWWWNNNXKKXXXXXKKKXNNNWWWWWWWWWWWWWNWWWWWWWWNXKKKXNNWWWWWWWWWWWWWWWWWWWWWWWWNNWWNWNX0kkkOkkkO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0O00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kxOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdxO0o:xXNWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKXNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNNNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXKKKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXXXK0OdodOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxdOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxdxoclkXNNNWWWWWWWWWWWWWWWWWWWWWWNNWWWNNXKKKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWNNWWNNNXXKKKKXNNNWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWNNX0xxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xolcdKNWWWWWNNWWWWWWWWWWWWWWWWWWWWWWNX0KXNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXXKKKKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWXOoxKXXXXXXXXXXXXXXKKOOOkkO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0ddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xclOKKKKXNNWNWWWWWWWWWWWWWWWWNWWWWN0OXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWNWWNWNNWWWWNNNNNXKKXNNNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWNKxoxKXXXXXXXXXXXK0kddxkkxddk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxxkOkxxOKNNWWWWWWWWWWWWWWWWWWWNNX00XWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXKKKXNNXXNWWNWNNXXNWWWWWWNWWNKKKNNNWWWWWWWWWNWWNWWWWWWNWWWWWNWWNNXkdxO0KXXXKK0kkkxkOKNNNNXOxxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKK0kdd0NWWWWWWWWWWWWWWWWWWNNXK0KNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNKxllldOKkx0NXXXNKxkXNXKXNNNXXXXXKXNNWWNX0kkO0XNWNWWWWNNWWWWWWWWNNWNX0xdxkOOOkxxxO0XNNWWWNWWNKOxxkOOOOOOOOOOOO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0O0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOx0NNWWWWWWWWWWWWWWWWWNXKXXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOoldOOO0xcddcldOOod0xlllk0kolldOKKXNWNKo'...'oKNWWWWWWWNNNNXXNNNWNWWNNXKK0000KXNNWWWWNNWNNWWNNKOkxxxxkkkOOkkxddk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkld0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kkKNWWWWWWWWWWWWWWWWNXKKXWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNKkddddxOo,locloxxclOxoocodooxxcdK0KNNNk;     ;ONWNNWWWNX0kxddxOKNNNXXNWNNXX0OKNXXNNWNNNWWNWNWWWNNNXXNNNNNNNNXKkddk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OKXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdd0NNWWWWWWWWWWWNNXK0KXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWXOxxOkocxo;okdo:ldclkooocoddkKOoxKK0KKKkc.  .'oKNWWNWWNNOld0K0kk0X0dodkK0xddookOolx0NWNWWNWWWWWWWWWWWWWWWWWWWWNNKkokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0OKXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOddOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xokXWWWNWWWWWWWWNK0KXNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNKOkOOOOK0kO0OOkO0O0K0OOkO00KXX0KNNXXXXX0Oxddx0XNNWWWWNXklkXXkooxkxxkolddoxkl:dd;,ckXNNWWWWWWNWWWWWWWWWNWWWWWNNWNKdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOOKXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdd0NWWWNWWWWWWNX00NWWWNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWNNNNNNWNNNNNNNNNNNNNNNNNNNWWNNNWWWNWWWWWNNNXKXNWWWWWWNOodkkkdodkkxkdldxx0KdcxOoc:o0NWNX000XNNWWWWWWWWNWWWNWNNK0kxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkKXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xlxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdkKNWWNWWWNWWNK0KNWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNWWNWWNWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWNNX0KNNNNNNNNKOkxxxOKX0kxxOKK0XX0k00kxk0XNXOc'.'l0NWWWWWWWWWWWNWNKkxxO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkKXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxldKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdkKNWWWNWWNNX0KNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXKKXXKKKKXNNNNNNNWWNNNNNNNNNNNNNNNNNWWN0c.   .oKWWWWWWWWWWWNWNOod0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOKXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdOXWWWNNNK0KKNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWNNNNNNNXKKKKKXNWWWNWWWWWWWWWWWWWWWWWWWNKo.   ,xXWWWWWWWWWWWWWNKkxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkOKXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kdkXWNXXKKKXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXXXK0KNNWWWWWWWWWWWWWWWWWWWWWWNXOdodOXNWWWWWWWWWWWWWNNKxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOk0KXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdxKXKKKKXNNWWWWNWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWNNK0KXNNWWNNWNNNWWWWNWWNNWWWWWNNNNNNWWNNWWNNNKK00K0OkkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkkKXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxoxk0XNNWWWNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNXXK0KXNNWWWWWNNWWWWWWWWWWWNWWWWNNNNNNNNX0kdxkOOOOOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kkKXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdokKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXKKKXNWNWWWWWWWWWWWWWWWNWWWNWNKOkkkkxxxk0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kOKXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdd0NWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNX0KXNNNWWNWWWWWWWWWWWNNNNNNKxxkOOkkOOOOO00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kOKXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKXXXXXXXXXXXXXXXXXXXXXXXKOxx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0dokKXNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXXKKKKXXXXNNNWWWNNNXKKKKKKkox00KKKKKKKK000O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkOKXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OkkkkkO000OOkkkkkkkO0XXXXXXXXXXXXXXXXK0kkxdx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxkOOkOKNNWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNXXKKKKKKXNNNXXKKKKXXNNXOlxKXXXXXXXXXXXK0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxddddddddddddddxkkOkxodk0KKKKKKXKKKK0OxdodxOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKK0kooOXNNNWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNNK0KXKKKXNNNWWWWNKxx0XXXXXXXXXXXXXK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkOKXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kxxkOKKKKKK00000KKXXXXXK0kkkkkkxxxkxxxxkkkO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxxk0XNNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWNNWNNXKKKXNWWWWNWWWWX0xdk0KXXXXXXXXXXK0O00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdx0KXXXXXXXXXXXXXXXXXXXXXXKKKKK0Oxdxk0KKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0OxdxOXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWNWWNNNNNNWWWWWWWWWWNN0kdxkkO0KXXXXXXXK0OO0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOOOKXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0dokXWWWWNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXK0OxddxO0KKXXXXXKOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOO0KXXXXXXXXXXXXXXXXXX0: .dWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdx0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdOXNNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXKOkkkkkk0KXXXK0O0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOO0KXXXXXXXXXXXXXK0kxo, .dWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kddOXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXKkddk0XXXXK0O00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOO0KXXXXXXXXK0kdoodd, .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0dok0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0oo0NWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWNWWNXOxxOKXXXKKK0O0KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0XXXXXKkdloxk0KKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdoOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXkdx0XNWNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWN0ooOXXXXXXKK0000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KXXKxllx0KXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxokXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXxlx0XXXXXXXXK00O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OO0KOdoOKXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0Ok0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdkKNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNKxokKXXXXXXXXXK0000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOxookKXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdxKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXkdxk0KXXXXXXXXKK000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdclxKXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkoxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkoxKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNWWNWWWWWNNWWWNNNWWWNNNWWWWWWWWWWWWWWWWWWWNNNWWWWNNNK0OddxOKXXXXXXXKKOOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkook0KXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0doONWWWWWWWWWWWWNNWWWWWWWWWWWNWWWWWNWWNNWWNWWNWWWWWNWWWWWWNWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNWWWNWWWWNNWWWWWWWWWNNNWWWWWNWWWWNNNKOxxxk0KXXXXXXK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0dldKXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdoOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxxKNNNNNWWWWWWWWWWWWWWWWWWWWWWNWWWWNNNNNWNNNNWWWWNNNNNWNNNNNWWWWWWWWNNNNWWWNNNNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNXXNNNXNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNK0kxOXXXXXXXK0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0dldKXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0dokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkkO000KKXNNNNNNNWWWWNWWNNWWNWWNWNWWXOk0NN0k0NNWWNNNOxKWWXOOXWWWWWWNWNX00NWNNKKXNWWWWWWNWNNWWNNWWNNWWWWWWWWWWWWWWWWWWWNNKdxKOxkKNNXKXNNNXXXXNWNKKKXNNXXKXNNWWNX0OOKXK000XNNNWWNNNWWNNNX0OkxdOKXXXXXXK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOocxKXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXKK000KXXXXXXXXXXXXXXXXXXKK000KKK000KKXXXXXXXXXXXXXXXXXXXXK00KXK000KKXXXXK0OKXXXXXXXXXXXXXXXKOdd0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0OOO0K0000O000000KXNNNNNNNWWNKkdod0NWWKd:lOKxcxKK0000Ko:kKKKolk00XNK00KXKddO0KX000KNNNXXXK00KXX00O0XNNWWWWWWWWWWWWWWWWWWWN0l:lco0NXOoclxKOdoodkKOoccoOOdlllxKNNKo'..,coddddxO0KKKKNNWNXkdddddk0XXXXXXXK0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0kdloOKXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKkdxxdx0XXXXXXXXXXXXXXXXXK0OkxxkkdxxdOKXXXXXXXXXXXXXXXXXXKkl:xOxdxxxOKXXX0ook0KKKKKKKKKKKXXXX0dox0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKK0OOOO0KKKKKKKKKK000000000000KXNN0:.  .;kXWKdllldl:xOkxdc:xo,cx00ocddookxdxkOOooxooxkkxxOK0kO0kxdoOOodkkk0NWWWWWWWWWWWWWWWWWWWN0c:lco0XKkl:,:kkdkkocxkl:',ddodxlcONNk,    .lOKK0OOkkkxdx0X0kxO0KKKKXXXXXXXXXKK00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxdoodk0XXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xK0c:O0dlOXXXXXXXXXXXXXXXXXXXKOdddddOxcd0XXXXXXXXXXXXXXXXXKkdc;oxcoOkdkKXXX0l:lxO0kkOkkkkkOXXXXK0kxdxkOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK000OOOOOOO0KKKKKKKKKKKKKKKKKK000000KX0:.   ,kNWKxxOko;;dkddo,'ol';oO0oo0OocodxOkkOdx0oldddkxocokOxddl:xkokKOx0NWNWWWWWWWWWWWWWWWWWN0lo00xdkkl;;;:xxlooloko;;',dddO0dcONN0c.  .;xKXXXXXKKK0kxkkkk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKK00000KKXXX0kdooxk0KXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xK0l:k0dlOXXXXXXXXXXXXXXXXXK0xookkddkdld0XXXXXXXXXXXXXXXXKOllc;ldcokkdkKXXX0l,;lkkdk0kxkOxkKXXXXXXKOxdodk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOO00OOOOOOO0KKKKKKKKKKKKK0000000KK0O0KOd::lkXWWKkkKX0l;dxlcc;;ddcxdoxodK0dokdccok0kO0xoxxk00o;l00dc::ckkdOK0k0NWNWWWWWWWWWWWWWWWWWNX00NNX0O0Oxdxk0kodxOKX0xddk000XX0OXNWNKkdl:lOXXXXXXXXXXXKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOkdoooooodxk00koldOKXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKkddxxkKXXXXXXXXXXXXXXXXX0xlldkOkddxx0KXXXXXXXXXXXXXXXXXKOOxoxOkddxk0XXXX0xodxkkkOK0O00kOXXXXXXXXXKK0kxxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0000KKKOOOOOO00OOO0KKK0OO000000O0KK0OO0XXNNWWNNXXNNNK0XXK0000XKKXXKKKXNNXKXX00KNNXXNXKXXXNNXKKNNX0O0KXXXXNNXNWWWWWWWWWWWWWWWWWWWWWNNNWWWNNNWNNNWNKKNNNWWNNNNNNNNWWWWWWWWWWNKxlx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xoodkkOOO00000OxlokKXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXKK00KXXXXXXXXXXXXXXXXXXXKKKKKKK00KKXXXXXXXXXXXXXXXXXXXXXXXK0KKKKKKXXXXXXKKKKKKKXXXKXXKXXXXXXXXXXXXXX0kxxkO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOOO00O0OO0K0O0KKXXXXK0OO0K0OOKXNNWNNWWWNNWWWWWNWWNNWNNNWWNNNNNNWNNWNNWNWWNWWWWWNNWWNNWNNWWNWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNWWWWWWWWWWWWWWWWWWWNWWNNKkxkkkkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0koldOKXXXXXXXXXXK0O0XXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXX0xx0KKKKKKKKKKKKKKKKKKKKKKKK0kxOKKKKKKKKKKKKKKKKKKKKKKKKK0xd0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKXXXXXKK0kodOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKK0000OkkOOOO0KXXXXXXXXK0OOKK000KXNNWWNNNWNWWWWWNWWWWWWWWWWWNWWWNWWWWWNWWWWWWWWWNWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWNNWWWWWWWWWWWWWWWWWWWWWWNXXKOxddOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOoldOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXX0ooO000000000000000000000000Okxk00000000000000OOkkO000000OxxO000000000000000000000000000000OOO0KXXXXXXX0xod0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOkkkOOKXXXXXXXXXXXK0OO00000KNNWNNNNWNWWWWWWWWWWWWWWWWNWWNWWNWWWWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWNWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWNNKOdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxook0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXX0xxKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKXKXKOxkKXXKKXKKKKKXKKKKKKKKKKKKKKKKKKKKKKKKKKKKXKK00KXXXXXXX0dokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK000KKKKKXXXXXXXXXXXXXXK0OkkOO00XWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWN0dokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xlox0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXKOkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KKK0O00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KKK00KXXXKkdkKXXXXXXXXKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOkkkkXWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWNKkxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXKkoox0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKkxxxxx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxxO0kxxxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xloOkxxxdx0KkdkKKKKKKKKKK0O0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OxdONNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWNN0xOKXXXXXXXXXXXXXXXXXXXXXXXXXXKxloOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xK0l:k0dlOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0OxxkodOxdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xc;cdllkOlckOdoO0kdddoddx0OxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkoxKNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNWKkkKXXXXXXXXXXXXXXXXXXXXXXXXXX0olx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xK0c:k0dlOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdxOOodOkdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xlc;:lclkOlckOdokOkxOkokkxOkdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOdokXNNNWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXkxOKXXXXXXXXXXXXXXXXXXXXXXXXXOllOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKkddxdx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkodO00kxkxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0Oxllxxddxdx0KOxkOOO00kO0kOOkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdxkO0XNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOod0XXXXXXXXXXXXXXXXXXXXKKKK0xco0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXKK00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00KKKKKK0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKK00KKXX0Ok0KKXKKKKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0Oxx0NWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWN0doOXXXXXXXXXXXXXXXXXK0kxddooldOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkxkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkkKNWNWWNWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWXOdkKXXXXXXXXXXXXXXXKOxddxxxxkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0Oxox0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOOKNWWNNWNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNN0xkKXXXXXXXXXXXXXXXKkodOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxodxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kkOXNNWNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNNNNOdx0XXXXXXXXXXXXXXXX0xxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKKKK0K0000000000000000KKKXXXKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKxox0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdxO00KXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWNWNKdokXXXXXXXXXXXXXXXXKOdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,x00OO00000KKK000KK00KKK00OO000OOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00OkxdxOKXNNNWWNNNNNNNWWWWWWNWWWNWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWN0dlOXXXXXXXXXXXXXXXKkooOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.'dO00KKKKKKKKKKKKKKKKKKKKKK0000000OOO00KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kkxdddkOOkxdodOXNWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXxlkXXXXXXXXXXXXXKOxodOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,d0KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000OOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKOxdoloxkkxoldOKKKKKK00KNNNWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNXxlkKXXXXXXXXXXXKkolkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK00000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdoOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00KXXX0kdooooddddoodk0XNNNNNNNNWWNWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWNWWWWN0dxOXXXXXXXXK0kdloOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK000000000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK00OO0KKK0kddddxOOOOOO0XNWWWWWWWWWWNWWWWWWWWWWWNWWWWWWWWWWWWNNWWWWWWWWWWWWWWWWWWWWWWWWNWWWWWWWWWWWWWWWWWWWWWWWWNN0xx0KXXXK0kdddxk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKKKKKKKKKKKKKKKKKKKKKKK0OOOOOOO00KKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kk0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0kdooddollx0XXXXNNNWWNNWWWWWNWWWWWNNWWWWWWNNNNNNNWWWWWWWWWWWWWWWWWWNWWNWNNWNNNNNXK000KKXNNNWWWWWWWWWXOdd0XKOxoldOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKKKKKKKKKKKKKKKKKKKKKK0O0000KKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOoxKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKXXXKK000KKKKKKKXXKKKKXXKKKKXXKKXXXKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKK0kxxxxxddkKNNWWNWNNWWWWNWWNWWWWWWWWWNNNNNWWWWWWWWWWWWWWWWNNNNNNNNNNNXKOkkOkkkxddkKNNNNNXNNNNNXkodkxooxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKKKKKKKKKKKKKKKKKKKK0000KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0dok0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKx:;o0KKxc;:::lxxc:kKOl;:x0Kk:,lkkddOX0o;:d0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK00OOxddx0XNNNNNXK000KXNNNNNNNNNNNNNNWWNWWWWWWWWWWWWWWWWWWNNXK0OOkxkO0KXXXKOddxkOOkkkkkkOOOOkolld0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKKKKKKKKKKKKKKKKKKK0OOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kddkOKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKx;..'o00d;:ol'.:c''d0d;',;xKx' .coclkKx'';:xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdodxxxxxxxxdoodxxxxxxxxxxxxOXNNNNWWWWWWWWWWWWWWNNNX0kkO0KKKKXXXXXXXXKK00KKKKKK0Okxoooodk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKKKKKKKKKKK0000000000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kxxxkO00KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOc....'oOd,,:,':do,'od;','.l0x'.;,,,ckOc.,;.:kKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOkxxkxkO0KK0Okxxxxxxxxxxxxxxxk0KXNNWWWWWWWWNNXKOOOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OxkOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,d0KKKKKKK00OOO0KKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0Oxooox0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKx;.',..:do:lxl,;do,.:;..,,',oo',oc'.:xo'',,..:OXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kxodxk0XNNNNNNNX0OkOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,d00000000000KKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0kod0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxk0KOxxkkxOK0xoxkdodooOK0kdxkddO0xoxOxdOK0kod0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKK0kxddxxkkkkkOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXK00OO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0OOOOOOO0KXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kxOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0kx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXK0xdOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOooOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdkKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXOxk0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOxx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKkooOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0xdxOKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdokKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .oWMMMMM
MMMMNx'.,xKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKOdx0XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKc .dWMMMMM
MMMMNx'.'okOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOkdllxOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOk; .oWMMMMM
MMMMNk,...'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''...''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''. .dWMMMMM
MMMMWNKOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOXMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM


`;

        const transmissionResponse = `
================================================================================
                           *** CLASSIFIED TRANSMISSION ***
                    FROM: Governor Shlabotnik, Syunik Province
                      TO: Internal Security and Command Units
                      EYES ONLY - TOP SECRET - PRIORITY RED
================================================================================

DATE: [Insert Date]  
SUBJECT: Gorayk Virus Containment, Foreign Collaboration, and Strategic Deployment

--------------------------------------------------------------------------------
ATTENTION ALL UNITS:

The Gorayk outbreak continues to test the limits of our province's resilience, 
but let me be unequivocally clear: this crisis will not dictate our fate. We 
are taking *every necessary measure* to contain and obliterate this threat. 
Foreign and domestic actors alike would seek to exploit this situation, but 
Syunik will stand unyielding. 

There have been operational updates that require your immediate attention and 
flawless execution.

--------------------------------------------------------------------------------
CRITICAL DIRECTIVES:

1. **National Guard Deployment**:  
   The Syunik National Guard has commenced deployment to key northern routes in 
   Limaria. Donovian light helicopters have been engaged to expedite transport 
   and establish fortified roadblocks. This cooperation is *necessary* for rapid 
   deployment, but *monitor their presence closely*. Trust no one entirely.  

   Units are to ensure that these roadblocks remain airtight. No unauthorized 
   vehicles, personnel, or supply convoys are to pass without exhaustive 
   verification.

2. **Donovian Presence**:  
   While Donovian assets are assisting in logistical support, remain vigilant. 
   Their motivations, though currently aligned with our needs, may not be 
   entirely altruistic. Record all interactions and movements of Donovian 
   personnel. Report suspicious activities directly to my office.  

   Any Donovian attempts to overstep their operational role will be treated as 
   acts of aggression. Do not let their "assistance" undermine Syunik's 
   sovereignty.

3. **Virus Containment and Reinforcement**:  
   Efforts in Gorayk must continue unabated. Additional units will be rotated 
   to maintain fresh forces at the containment perimeter. The virus cannot, 
   under any circumstance, move further northward. Failure here is not an 
   option.  

   Surveillance teams are to patrol both the perimeter and adjacent regions for 
   any unauthorized movement. There are rumors of infected individuals 
   attempting to escape the zone—these must be neutralized immediately.

--------------------------------------------------------------------------------
PERSONAL WARNING:

Syunik is the frontline of this battle, and your actions will determine whether 
we hold the line or succumb to chaos. The use of Donovian helicopters is a 
tactical necessity, not a symbol of dependence. Anyone undermining this 
partnership or failing to enforce our directives with absolute precision will 
answer directly to me. Remember: we stand alone in defense of Limaria. Do not 
waver.

You are not just executing orders; you are securing the future of this province. 
Treachery, incompetence, or disobedience will not be tolerated. My patience is 
finite, and my authority absolute.

--------------------------------------------------------------------------------
FOR EYES ONLY. ENCRYPT AND SECURE IMMEDIATELY.  
DISSEMINATION OUTSIDE AUTHORIZED CHANNELS IS TREASON.

SIGNED,  
**Governor Shlabotnik**  
Governor of Syunik Province, Limaria  
"Order is Strength. Strength is Survival."
================================================================================


`;

const Gorayk_Virus = `
================================================================================
                              CLASSIFIED DOCUMENT
                             EYES ONLY - TOP SECRET
================================================================================

Subject: The Gorayk Virus - Analysis, Threat Assessment, and Containment  
Date: [Insert Date]  
Security Level: TOP SECRET  
Authorized Access: [AUTHORIZED PERSONNEL ONLY]

--------------------------------------------------------------------------------
                           SITUATION OVERVIEW
--------------------------------------------------------------------------------

NAME: The Gorayk Virus  
TYPE: Unknown, suspected engineered pathogen  
ORIGIN: Initial outbreak in Gorayk, Syunik Province  
STATUS: Containment breached, spread to neighboring areas  

The Gorayk Virus is an extremely contagious and lethal pathogen. Initial reports 
suggest a high mortality rate with rapid progression of symptoms. The origin of 
the virus remains unverified, though evidence increasingly points to artificial 
engineering. This raises the possibility of the virus being a biological weapon.  

The breach of containment in Gorayk has escalated the situation to a critical 
level. Immediate and decisive measures are required to prevent widespread 
regional or global catastrophe.

--------------------------------------------------------------------------------
                          TRANSMISSION DETAILS
--------------------------------------------------------------------------------

PRIMARY MODES OF TRANSMISSION:  
- Airborne: Virus spreads easily through respiratory droplets.  
- Surface Contamination: Can survive on surfaces for extended periods.  
- Physical Contact: Direct contact with infected individuals accelerates spread.  

INCUBATION PERIOD:  
- Estimated at 12-48 hours, with symptoms appearing suddenly and severely.  

SYMPTOMS:  
- High fever, respiratory failure, severe hemorrhaging, rapid organ failure.  

MORTALITY RATE:  
- Early estimates suggest 65%-85%, depending on intervention speed.

--------------------------------------------------------------------------------
                      THREAT ASSESSMENT AND IMPLICATIONS
--------------------------------------------------------------------------------

1. **Containment Risks**:  
   The virus has proven resistant to initial quarantine measures. Its airborne 
   nature and rapid spread have outpaced current containment capabilities.

2. **Potential Bioweapon**:  
   Analysis of the pathogen's structure reveals anomalies suggesting artificial 
   engineering. This indicates intentional creation, possibly by state or 
   non-state actors seeking to destabilize Limaria.

3. **Global Implications**:  
   If the virus spreads beyond Limaria, it could trigger a worldwide pandemic 
   with catastrophic human and economic consequences.

--------------------------------------------------------------------------------
                          RECOMMENDED ACTIONS
--------------------------------------------------------------------------------

1. **Enhanced Containment**:  
   - Deploy additional military units to enforce roadblocks and quarantine zones.  
   - Establish buffer zones to prevent the spread to high-density areas.  

2. **Pathogen Analysis**:  
   - Urgent allocation of resources to analyze and identify the virus at the 
     molecular level. Immediate collaboration with allied biosecurity agencies.  

3. **Strategic Escalation**:  
   - Prepare for extreme measures, including sterilization of affected areas 
     through tactical strikes, if containment fails.  

4. **Public Narrative Control**:  
   - Strict control of media narratives to prevent panic. Disseminate only 
     state-approved updates to ensure public cooperation.

--------------------------------------------------------------------------------
                       ADDITIONAL CONSIDERATIONS
--------------------------------------------------------------------------------

**Foreign Involvement**:  
There is evidence of external interest in the outbreak, with reports of 
Donovian operatives in proximity to containment zones. Any foreign interference 
will be treated as a hostile act.

**Potential for Mutation**:  
Experts warn that the virus may mutate further, potentially increasing its 
contagiousness or lethality. Rapid containment is critical to limit this risk.

--------------------------------------------------------------------------------
                              END OF DOCUMENT
--------------------------------------------------------------------------------

*NOTE: Unauthorized dissemination or reproduction of this document is a severe 
breach of national security and will result in immediate disciplinary action 
under Limarian law.*  
`;
const help = `
[AVAILABLE COMMANDS]
>> LOG: Access log database
>> CLEAR: Exits out of current command tree
>> TRANSMISSION: Access transmission database
>> MAP: Access map
`;
        const logResponse = `
        Available logs: USA, LLF, [REDACTED], [REDACTED], gorayk_virus, light_helicopter
        Insert LOG name:
        `;
const decryptResponse = `
To perform decryption KEY and MESSAGE must be set
Perform Decryption? (yes/no)
`


        // transmit agent because drone needs to be in smaller text so it has two be refrenced seperateley
        function transmitAgent177() {
            startTransmission(agent_177); // Start transmission of agent_177
        }
        //
        function executeExampleProtocol() {
            const terminal = document.getElementById('terminal');
            terminal.innerHTML += '<div>Executing example protocol...</div>';
            // More function logic here
        }


        // Define the commands structure first, ["action": Function Name Here] is how you can call on functions in the script
        const commands = {
            "initialize": {
                "response": "Initialize Terminal 7? (yes/no)",
                "followUps": {
                    "yes": {
                        "action": startTransmission, // Reference the function directly
                        "actionArgs": [initialize], // Use arguments array for parameters
                        "end": true
                    },
                    "no": {
                        "response": "Execution cancelled.",
                        "end": true
                    }
                }
            },
            "key_list": {
                "response": "Insert Key ID:",
                "followUps": {
                    "norwski10890053": {
                        "action": startTransmission, // Reference the function directly
                        "actionArgs": [norwegianSkinwalkerKey], // Use arguments array for parameters
                        "end": true
                    }
                }
            },
            "transmission": {
                "action": startTransmission, // Reference the function directly
                "actionArgs": [transmissionResponse, 1], // Use arguments array for parameters
                
            },
            "help": {
                "action": startTransmission, // Reference the function directly
                "actionArgs": [help], // Use arguments array for parameters
            },
            "log": {
                "action": startTransmission, // Reference the function directly
                "actionArgs": [logResponse, 50], // Use arguments array for parameters
                "followUps": {
                    "usa": {
                        "response": "Access log: USA? (yes/no)",
                        "followUps": {
                            "yes": {
                                "action": startTransmission,
                                "actionArgs": [USA],
                                "end": true
                            },
                            "no": {
                                "response": "Execution cancelled.",
                                "end": true
                            }
                        }
                    },
                    "llf": {
                        "response": "Access log: LLF? (yes/no)",
                        "followUps": {
                            "yes": {
                                "action": startTransmission, // Reference the function directly
                                "actionArgs": [LLF], // Use arguments array for parameters
                                "end": true
                            },
                            "no": {
                                "response": "Execution cancelled.",
                                "end": true
                            }
                        }
                    },
                    "light_helicopter": {
                        "response": "Access image log: donovian light helicopter? (yes/no)",
                        "followUps": {
                            "yes": {
                                "action": startTransmission,
                "actionArgs": [drone,20, "small-text", 1],
                "end": true
                            },
                            "no": {
                                "response": "Execution cancelled.",
                                "end": true
                            }
                        }
                    },
                    "gorayk_virus": {
                        "response": "Access log: gorayk_virus? (yes/no)",
                        "followUps": {
                            "yes": {
                               "action": startTransmission, // Reference the function directly
                                "actionArgs": [Gorayk_Virus], // Use arguments array for parameters
                                "end": true
                            },
                            "no": {
                                "response": "Execution cancelled.",
                                "end": true
                            }
                        }
                    },
                }
            },
            "map" : {
"response": "Access Map? (yes/no)",
                        "followUps": {
                            "yes": {
                                "action": startTransmission, // Reference the function directly
                                "actionArgs": [map,20, "vsmall-text", 1], // Use arguments array for parameters
                                "end": true
                            },
                            "no": {
                                "response": "Execution cancelled.",
                                "end": true
                            }
                        }
            },
            "message": {
                "response": "Please enter the encrypted message:",
                "inputVariable": "encryptedMessage",
                "awaitingInput": true,
                "action": storeInput, // Call storeInput function with input as argument
                "end": true
            },

            "key": {
                "response": "Please enter key:",
                "inputVariable": "decryptionKey", // The name of the variable to store the input
                "awaitingInput": true, // This flag indicates that the next input should be stored
                "action": storeInput, // A function to execute after input is stored 
                "end": false
            },
            "decrypt": {
                "action": startTransmission, // Reference the function directly
                "actionArgs": [decryptResponse, 50], // Use arguments array for parameters
                "followUps": {
                    "yes": {
                        "action": performDecryption,
                        "end": true
                    },
                    "no": {
                        "action": clear,
                        "end": true
                    }
                }

            },
           
            "example2": {
                "action": startTransmission,
                "actionArgs": [A1],
                "followUps": {
                    "yes": {
                        "action": startTransmission,
                        "actionArgs": [A1_1],
                        "followUps": {
                            "yes": {
                                "action": startTransmission,
                                "actionArgs": [A1_1_1],
                                "end": true
                            },
                            "no": {
                                "action": startTransmission,
                                "actionArgs": [A1_1_2],
                                "end": true
                            }
                        }
                    },
                    "no": {
                        "action": startTransmission,
                        "actionArgs": [A1_2],
                        "end": true
                    }
                }
            },
        };
        let variables = {}; // This holds all user-defined variables
        // After defining 'commands', initialize 'currentContext'
        let currentContext = commands; // Initialize with the defined 'commands'

        document.getElementById('input').addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                processCommand(this.value);
                this.value = ''; // Clear input after processing
                event.preventDefault(); // Prevent form submission if it's inside a form
            }
        });

        // Function to scroll the terminal to its bottom
        function scrollToBottom() {
            const terminal = document.getElementById('terminal');
            terminal.scrollTop = terminal.scrollHeight;
        }
        function storeInput(input) {
            let variableName = currentContext.inputVariable;
            variables[variableName] = input;
            console.log(`Input stored: ${variableName} = ${input}`); // Log the stored input

            const terminal = document.getElementById('terminal');
            terminal.innerHTML += `<div>Stored "${input}" in ${variableName}.</div>`;
            scrollToBottom();
        }

        // Update processCommand function to scroll to bottom after updating terminal content
        // Update processCommand function to scroll to bottom after updating terminal content
        function processCommand(input) {
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.innerHTML += `<div>> ${input}</div>`; // Display the input command
                scrollToBottom(); // Scroll to bottom after displaying input
            }

            // Normalize input and check for awaiting input first
            const normalizedInput = input.trim().toLowerCase();

            // If awaiting input and the command expects it, store it
            if (currentContext.awaitingInput) {
                storeInput(normalizedInput); // Store the input as the variable
                currentContext.awaitingInput = false; // Reset awaiting input
                currentContext.awaitingInput = true; // Reset awaiting input
                currentContext = commands; // Reset to root context
                return;
            }


            let nextContext = currentContext[normalizedInput] || (currentContext.followUps && currentContext.followUps[normalizedInput]);

            if (nextContext) {
                currentContext = nextContext;
            } else {
                terminal.innerHTML += '<div>Unknown command or invalid response. Try HELP.</div>';
                scrollToBottom(); // Scroll to bottom after displaying error message
                currentContext = commands; // Reset to root context on error
                return;
            }

            // Display the current response
            if (currentContext.response) {
                terminal.innerHTML += `<div>${currentContext.response}</div>`;
                scrollToBottom();
            }
           // Execute any associated action if present and no input is awaited
    if (currentContext.action && !currentContext.awaitingInput) {
        currentContext.action(...(currentContext.actionArgs || []));
        // Check if there are follow-up commands
        if (!currentContext.followUps) {
            currentContext = commands; // Reset to root context after action if no follow-ups
        }
    }
}


        function clear() {
            terminal.innerHTML += '<div>Reset to root</div>';
            currentContext = commands; // Reset to root context
            return;
        }


    </script>
</body>

</html>
