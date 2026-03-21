EXAM_ID = "year7-assessment-task-1"

EXAM = {
    "name": "Year 7 Assessment Task 1 - Multiple Choice Quiz",
    "description": "A 25-question Year 7 multiple-choice science assessment imported from the provided paper exam.",
    "questionCount": 25,
    "sourceFormat": "docx",
    "sourceName": "Year 7 Assessment Task 1 (Multiple Choice)",
}


def glossary(*pairs: tuple[str, str]) -> list[dict]:
    return [{"term": term, "definition": definition} for term, definition in pairs]


QUESTIONS = [
    {
        "id": "q1",
        "order": 1,
        "topic": "Part 1",
        "stemHtml": "<p>Which tool would you use to measure the length of an object?</p>",
        "options": ["Thermometer", "Measuring cylinder", "Ruler", "Stopwatch"],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q2",
        "order": 2,
        "topic": "Part 1",
        "stemHtml": "<p>Which of your human senses would you use to determine the colour of an animal's fur?</p>",
        "options": ["Touch", "Taste", "Sight", "Smell"],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q3",
        "order": 3,
        "topic": "Part 1",
        "stemHtml": "<p>What is the main purpose of science?</p>",
        "options": [
            "To create fun experiments and activities.",
            "To understand the natural world using observations and evidence.",
            "To prove that every idea is correct.",
            "To make people agree with each other.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Evidence", "Information that shows if something is true."),
            ("Experiment", "Testing an idea by doing a planned investigation."),
            ("Observation", "Something noticed using your senses (sight, smell, touch, etc.)."),
        ),
    },
    {
        "id": "q4",
        "order": 4,
        "topic": "Part 1",
        "stemHtml": (
            "<p>A student finds that students who drank more fizzy drink had more tooth decay.</p>"
            "<p>Which statement is correct?</p>"
        ),
        "options": [
            "The amount of tooth decay affects how much fizzy drink you drink.",
            "The amount of fizzy drink affects how much tooth decay you have.",
            "You should never drink fizzy drink.",
            "Fizzy drink does not affect your teeth.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Affects", "Causes something to change."),
            ("Fizzy Drink", "A drink with bubbles of gas, like soft drink or soda."),
            ("Tooth Decay", "Damage to teeth like holes and cavities."),
        ),
    },
    {
        "id": "q5",
        "order": 5,
        "topic": "Part 1",
        "stemHtml": (
            "<p>A student performed an experiment where they heated water in a beaker.</p>"
            "<p>Which graph below shows the temperature of the water increasing over time?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q5-graphs.png",
        "imageAlt": "Four graph options labelled Graph A to Graph D.",
        "options": ["Graph A", "Graph B", "Graph C", "Graph D"],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q6",
        "order": 6,
        "topic": "Part 2",
        "stemHtml": "<p>Which piece of equipment is best for measuring 50 mL of liquid?</p>",
        "options": ["Beaker", "Measuring cylinder", "Digital scales", "Evaporating basin"],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Equipment", "The tools or items used in an experiment."),
        ),
    },
    {
        "id": "q7",
        "order": 7,
        "topic": "Part 2",
        "stemHtml": (
            "<p>A student sees bubbles forming and hears a fizzing sound when a tablet is placed into water.</p>"
            "<p>Which two senses are being used to make these observations?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q7-observation.jpg",
        "imageAlt": "A tablet fizzing in water.",
        "options": [
            "Touch and taste.",
            "Sight and hearing.",
            "Smell and sight.",
            "Hearing and taste.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Observation", "Something noticed using your senses (sight, smell, touch, etc.)."),
        ),
    },
    {
        "id": "q8",
        "order": 8,
        "topic": "Part 2",
        "stemHtml": "<p>How do scientists usually begin to build knowledge about the world?</p>",
        "options": [
            "By making observations and asking questions.",
            "By guessing what might be true.",
            "By copying other scientists' results.",
            "By making up ideas and theories.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Observation", "Something noticed using your senses (sight, smell, touch, etc.)."),
        ),
    },
    {
        "id": "q9",
        "order": 9,
        "topic": "Part 2",
        "stemHtml": (
            "<p>A student wants to test how sunlight affects the growth of their bean plants.</p>"
            "<p>They do an experiment to find out if bean plants grow taller when they get more sunlight.</p>"
            "<p>Which variable is the independent variable?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q9-bean-plants.jpg",
        "imageAlt": "Bean plant experiment setup.",
        "options": [
            "The type of soil used.",
            "The amount of sunlight each plant receives.",
            "The size of the pots.",
            "The brand of fertiliser.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Independent Variable", "This is the variable in the experiment that you deliberately change."),
        ),
    },
    {
        "id": "q10",
        "order": 10,
        "topic": "Part 2",
        "stemHtml": (
            "<p>A student performed an experiment where they grew a plant and measured its height every week.</p>"
            "<p>They watered it every day.</p>"
            "<p>One day, they accidentally watered their plant with herbicide, which killed the plant.</p>"
            "<p>In what week did they accidentally water the plant with herbicide?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q10-plant-growth.png",
        "imageAlt": "A graph showing plant height over several weeks.",
        "options": ["Week 2", "Week 3", "Week 4", "Week 5"],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Herbicide", "A chemical which kills plants."),
        ),
    },
    {
        "id": "q11",
        "order": 11,
        "topic": "Part 3",
        "stemHtml": (
            "<p>You have been asked to design an experiment.</p>"
            "<p>You need to find out how the temperature of water affects how long it takes a Panadol tablet to dissolve in it.</p>"
            "<p>Which method below is the best?</p>"
        ),
        "options": [
            "Heat water in a beaker, crush the tablet, guess how long it takes the tablet to dissolve, then take the Panadol and drink the water.",
            "Put a tablet in cold water, stir it constantly, measure how hot the water becomes, then repeat the experiment.",
            "Start a timer, add the tablet to the water, measure the water temperature every 10 seconds, stop the timer, then repeat the experiment.",
            "Measure water temperature, add the tablet to the water, start the timer, stop the timer when the tablet has dissolved, then repeat the experiment.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q12",
        "order": 12,
        "topic": "Part 3",
        "stemHtml": (
            "<p>A student observes a candle burning.</p>"
            "<p>Which is an observation made using sight?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q12-candle.jpg",
        "imageAlt": "A lit candle.",
        "options": [
            "The wax feels warm when I touch it with my finger.",
            "I think the flame would go out if I put water on it.",
            "The wax melts and runs down the side of the candle.",
            "I think a fatter candle would take longer to burn.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q13",
        "order": 13,
        "topic": "Part 3",
        "stemHtml": "<p>Which example best shows how scientists use observation, experiments, and analysis?</p>",
        "options": [
            "Guessing what will happen and writing it as fact.",
            "Reading a scientific book and accepting the things that make sense.",
            "Carrying out an experiment, recording results, and looking for patterns.",
            "Making an observation using the senses and deciding the cause based on common sense.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Observation", "Something noticed using your senses (sight, smell, touch, etc.)."),
            ("Experiment", "Testing an idea by doing a planned investigation."),
            ("Analysis", "Looking at your results to find patterns or meaning."),
        ),
    },
    {
        "id": "q14",
        "order": 14,
        "topic": "Part 3",
        "stemHtml": (
            "<p>A student investigates how temperature affects how quickly sugar dissolves.</p>"
            "<p>Which is the dependent variable that the student measures?</p>"
        ),
        "options": [
            "The amount of sugar added to each test.",
            "The time taken for the sugar to completely dissolve.",
            "The temperature of the water before adding sugar.",
            "The number of times the mixture is stirred.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q15",
        "order": 15,
        "topic": "Part 3",
        "stemHtml": (
            "<p>A student did an experiment using four candles, each with a different smell: vanilla, orange, cinnamon, and lavender.</p>"
            "<p>They measured the height of each candle every ten minutes.</p>"
            "<p>When the candle's flame went out, the height of the candle stopped decreasing.</p>"
            "<p>Which candle burned the longest before going out?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q15-candle-heights.png",
        "imageAlt": "A graph comparing candle height over time for four scented candles.",
        "options": ["Vanilla", "Orange", "Cinnamon", "Lavender"],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q16",
        "order": 16,
        "topic": "Part 4",
        "stemHtml": (
            "<p>A student wants to measure the temperature of a beaker of water. They have two different options of thermometer to use.</p>"
            "<p>If the student wants to design an experiment that is as valid, accurate and reliable as possible, which of the following statements is true?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q16-thermometers.png",
        "imageAlt": "Two thermometer options labelled Option A and Option B.",
        "options": [
            "They should use Option B: Analog Thermometer because mercury is bad for the environment.",
            "They should use Option B: Analog Thermometer because they are cheaper to buy.",
            "They should use Option A: Digital Thermometer because the number can be read more easily.",
            "They should use Option B: Analog Thermometer because they are less likely to be inaccurate.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q17",
        "order": 17,
        "topic": "Part 4",
        "stemHtml": (
            "<p>A scientist wants to perform an experiment to find out if the local tip smells worse during the hotter months of the year.</p>"
            "<p>They decide to use a digital smell detector that is attached to a computer, rather than just using their nose and sense of smell.</p>"
            "<p>Why is the digital detector more accurate?</p>"
        ),
        "options": [
            "The digital detector gives a result faster than the human nose.",
            "The detector might run out of batteries.",
            "The detector measures the amount of scent better than a human nose.",
            "The detector can name the exact chemical and can be connected to a database of chemical names.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Detector", "A device or tool that finds or measures something."),
        ),
    },
    {
        "id": "q18",
        "order": 18,
        "topic": "Part 4",
        "stemHtml": "<p>Why are experimentation and analysis important in science?</p>",
        "options": [
            "Experiments provide evidence and analysis allows scientists to find patterns.",
            "Experiments make experiments more fun and proper analysis encourages more people to study Science.",
            "Experiments help prove every idea is correct, and analysis allows scientists to learn new things about the world.",
            "Analysis of results makes new experiments easier to share with the public.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q19",
        "order": 19,
        "topic": "Part 4",
        "stemHtml": (
            "<p>A student wishes to complete an experiment to test how the amount of light a plant gets affects how tall it grows.</p>"
            "<p>Which experiment below is the most valid?</p>"
        ),
        "options": [
            "Place two different types of plants in the same amount of light and measure how tall they grow after one week.",
            "Place two of the same type of plant in the same amount of light and measure how tall they grow after one week.",
            "Place two of the same type of plant in different amounts of light and measure how tall they grow after one week.",
            "Place two different types of plants in different amounts of light and measure how tall they grow after one week.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q20",
        "order": 20,
        "topic": "Part 4",
        "stemHtml": (
            "<p>A student did an experiment that measured their heart rate during four different exercises: walking, running, push-ups and sit-ups.</p>"
            "<p>According to the graph, which exercise caused the heart rate to increase the most over the first sixty (60) seconds?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q20-heart-rate.png",
        "imageAlt": "A graph comparing heart rate over time during four exercises.",
        "options": ["Walking", "Running", "Push-ups", "Sit-ups"],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q21",
        "order": 21,
        "topic": "Part 5",
        "stemHtml": (
            "<p>A student wants to do an experiment which tests whether the type of ball affects how far the ball goes when thrown in the air.</p>"
            "<p>They have access to a baseball, tennis ball, golf ball and trundle wheel.</p>"
            "<p>Which method below gives the most valid, accurate, and reliable results?</p>"
        ),
        "imageUrl": "./assets/exams/year7-assessment-task-1/q21-trundle-wheel.jpg",
        "imageAlt": "A trundle wheel.",
        "options": [
            "Throw each ball once, record the distance using a 1 m ruler, and take an average of the three distances. Analyse the results to look for a pattern. Repeat this experiment ten times.",
            "Throw one ball five times, record the distance using a 1 m ruler, take an average of the values, then repeat this for the other two balls. Analyse the results and look for a pattern.",
            "Throw one ball three times, record the distance using a trundle wheel, take an average of the values, then repeat this for the other two balls. Analyse the results and look for a pattern.",
            "Throw one ball five times, record the distance using a trundle wheel, take an average of the values, then repeat this for the other two balls. Analyse the results and look for a pattern.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Valid", "Measures what it is supposed to measure."),
            ("Accurate", "Close to the true value."),
            ("Reliable", "Gives the same result when repeated."),
        ),
    },
    {
        "id": "q22",
        "order": 22,
        "topic": "Part 5",
        "stemHtml": (
            "<p>An elderly scientist wants to compare the loudness of different bird calls.</p>"
            "<p>She knows that, because of her age, her ears do not work as well as they used to.</p>"
            "<p>Which of the following methods will allow her results to be both accurate and reliable?</p>"
        ),
        "options": [
            "Record the bird calls on her phone and use computer software to measure the loudness of each bird call. Repeat this every day for five (5) days.",
            "Record the bird calls on her computer and play them back on large computer speakers. Repeat this every day for ten (10) days.",
            "Record the bird calls on her phone and listen to the recordings using headphones. Repeat this every day for ten (10) days.",
            "Use her ears to listen to the birds directly and rank them from loudest to quietest. Repeat this every day for fifteen (15) days.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q23",
        "order": 23,
        "topic": "Part 5",
        "stemHtml": (
            "<p>The explanations about how the world works given by science tend to keep getting better and better as time goes on.</p>"
            "<p>Which of the following statements best explains how the Scientific Method ensures that scientific explanations tend to get better over time?</p>"
        ),
        "options": [
            "By keeping the same explanations until someone believes they have found a better explanation.",
            "By choosing explanations that are agreed on by most scientists.",
            "By teaching the same ideas so everyone has the same quality of education.",
            "By testing explanations in experiments to try and show that they might be wrong.",
        ],
        "alternateWording": [],
        "glossaryTerms": glossary(
            ("Scientific Method", "A step-by-step way of answering questions scientifically using evidence and experiments."),
            ("Experiment", "Testing an idea by doing a planned investigation."),
            ("Evidence", "Information that shows if something is true."),
        ),
    },
    {
        "id": "q24",
        "order": 24,
        "topic": "Part 5",
        "stemHtml": (
            "<p>Two students, Alan and Beth, investigate how changing the angle of a ramp affects how long it takes a toy car to reach the bottom.</p>"
            "<p>They each use a different method, outlined below:</p>"
            "<div class=\"table-shell\">"
            "<table>"
            "<thead><tr><th>Student</th><th>Method</th></tr></thead>"
            "<tbody>"
            "<tr><td>Alan</td><td>A toy car is placed at the top of the ramp. Alan lets go of the car and uses the stopwatch on his phone to time how long the car takes to reach the bottom of the ramp. He makes the ramp a little bit steeper, then repeats the same measurement as before. He then repeats the above steps fifteen (15) times but uses a different toy car each time.</td></tr>"
            "<tr><td>Beth</td><td>Beth sets up a video camera to record her experiment. A toy car is placed at the top of the ramp. Beth lets go of the car and uses the video footage from her camera to time how long the car takes to reach the bottom of the ramp. She then repeats the above steps ten (10) times using the same car each time.</td></tr>"
            "</tbody>"
            "</table>"
            "</div>"
            "<p>Which statement correctly evaluates their methods?</p>"
        ),
        "options": [
            "Beth's investigation is invalid because she did not change the independent variable.",
            "Beth's investigation is more valid because only one variable was changed.",
            "Alan's investigation is more valid because it tests more variables.",
            "Alan's investigation is invalid because he changed the steepness of the ramp each repeat.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
    {
        "id": "q25",
        "order": 25,
        "topic": "Part 5",
        "stemHtml": (
            "<p>A student measured the percentage of battery remaining on their phone throughout the day. They also kept a table of how they were using their phone throughout the day.</p>"
            "<div class=\"table-shell\">"
            "<table>"
            "<thead><tr><th>Time of Day</th><th>Battery Percentage Remaining (%)</th></tr></thead>"
            "<tbody>"
            "<tr><td>7:00 am</td><td>100</td></tr>"
            "<tr><td>8:25 am</td><td>96</td></tr>"
            "<tr><td>2:45 pm</td><td>94</td></tr>"
            "<tr><td>7:00 pm</td><td>54</td></tr>"
            "<tr><td>10:00 pm</td><td>14</td></tr>"
            "</tbody>"
            "</table>"
            "</div>"
            "<div class=\"table-shell\">"
            "<table>"
            "<thead><tr><th>Time of Day</th><th>How phone was being used</th></tr></thead>"
            "<tbody>"
            "<tr><td>7:00 am - 8:25 am</td><td>Sending messages.</td></tr>"
            "<tr><td>8:25 am - 2:45 pm</td><td>Not being used.</td></tr>"
            "<tr><td>2:45 pm - 7:00 pm</td><td>Playing games.</td></tr>"
            "<tr><td>7:00 pm - 10:00 pm</td><td>Watching YouTube.</td></tr>"
            "</tbody>"
            "</table>"
            "</div>"
            "<p>Based only on the data from the two results tables, which of the following statements is most correct?</p>"
        ),
        "options": [
            "The phone battery goes down even when the phone is not being used.",
            "Playing games makes the battery go down the fastest.",
            "Sending messages uses the same amount of battery as not using the phone at all.",
            "Phone use has no effect on battery level.",
        ],
        "alternateWording": [],
        "glossaryTerms": [],
    },
]


ANSWER_KEYS = {
    "q1": 2,
    "q2": 2,
    "q3": 1,
    "q4": 1,
    "q5": 3,
    "q6": 1,
    "q7": 1,
    "q8": 0,
    "q9": 1,
    "q10": 2,
    "q11": 3,
    "q12": 2,
    "q13": 2,
    "q14": 1,
    "q15": 1,
    "q16": 2,
    "q17": 2,
    "q18": 0,
    "q19": 2,
    "q20": 1,
    "q21": 3,
    "q22": 0,
    "q23": 3,
    "q24": 1,
    "q25": 0,
}
