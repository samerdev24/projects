document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const textDisplay = document.getElementById('textDisplay');
  const startButton = document.getElementById('startButton');
  const childReadyButton = document.getElementById('childReadyButton');
  let words = [];
  let currentWordIndex = 0;
  let isTeacherReading = false;
  let recognition;
  let attempts = 0;

  // Set text replacements
  responsiveVoice.setTextReplacements([
    {
      searchvalue: 'human',
      newvalue: 'robot',
      collectionvoices: 'Arabic Female',
    },
  ]);

  const speakText = (text) => {
    if (!text.trim()) {
      alert('يرجى إدخال نص لقراءته');
      return;
    }

    words = text.split(' ');
    currentWordIndex = 0;
    textDisplay.innerHTML = '';
    highlightText();

    responsiveVoice.speak(text, 'Arabic Female', {
      rate: parseFloat(speedSelect.value),
      onstart: () => {
        isTeacherReading = true;
      },
      onend: () => {
        isTeacherReading = false;
        console.log('Waiting for child to repeat...');
        responsiveVoice.speak('هل أنت جاهز للقراءة؟', 'Arabic Female', {
          rate: parseFloat(speedSelect.value),
          onend: () => {
            startReadyCheck();
          },
        });
      },
    });
  };

  const highlightText = () => {
    const interval = setInterval(() => {
      if (!isTeacherReading || currentWordIndex >= words.length) {
        clearInterval(interval);
        return;
      }

      textDisplay.innerHTML = '';
      for (let i = 0; i < words.length; i++) {
        const span = document.createElement('span');
        span.textContent = words[i] + ' ';
        if (i === currentWordIndex) {
          span.classList.add('speaking');
        }
        textDisplay.appendChild(span);
      }
      currentWordIndex++;
    }, 500 / parseFloat(speedSelect.value)); // Adjust the interval timing based on speech rate
  };

  const startRecognition = () => {
    recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = 'ar-SA';

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      const correctText = words.join(' ').trim();

      if (spokenText === correctText) {
        textDisplay.classList.add('correct');
        console.log('Correct!');
      } else {
        attempts++;
        textDisplay.classList.add('incorrect');
        console.log(`Incorrect! Attempt ${attempts} of 3. Try again.`);

        if (attempts < 3) {
          responsiveVoice.speak('خطأ! حاول مرة أخرى.', 'Arabic Female', {
            rate: parseFloat(speedSelect.value),
            onend: startRecognition,
          });
        } else {
          responsiveVoice.speak(
            'لقد وصلت إلى الحد الأقصى من المحاولات. حاول مرة أخرى لاحقًا.',
            'Arabic Female'
          );
          console.log('Maximum attempts reached. Please try again later.');
        }
      }
    };

    recognition.onend = () => {
      if (attempts < 3 && !textDisplay.classList.contains('correct')) {
        recognition.start();
      } else {
        console.log('Recognition ended');
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
    };

    recognition.start();
  };

  const startReadyCheck = () => {
    const readyRecognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    readyRecognition.lang = 'ar-SA';

    readyRecognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim().toLowerCase();
      if (spokenText === 'نعم') {
        startRecognition();
      } else {
        responsiveVoice.speak(
          'حسنًا، أخبرني عندما تكون جاهزًا.',
          'Arabic Female'
        );
      }
    };

    readyRecognition.onend = () => {
      console.log('Ready check ended');
    };

    readyRecognition.onerror = (event) => {
      console.error('Ready check error:', event.error);
    };

    readyRecognition.start();
  };

  startButton.addEventListener('click', () => {
    const text = textInput.value;
    if (!text.trim()) return;

    speedSelect = document.getElementById('speedSelect');
    if (!speedSelect) {
      console.error('speedSelect element not found');
      return;
    }

    words = text.split(' ');
    currentWordIndex = 0;
    textDisplay.innerHTML = '';
    textDisplay.classList.remove('correct', 'incorrect');

    speakText(text);
    childReadyButton.style.display = 'block'; // Show the child ready button after teacher reading
  });

  childReadyButton.addEventListener('click', () => {
    if (recognition) {
      recognition.stop(); // Stop recognition to prevent further listening
    }
    attempts = 0; // Reset attempts when child is ready to read again
    startRecognition();
  });
});
