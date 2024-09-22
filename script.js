function convertJianpu() {
    const VF = Vex.Flow;
    const div = document.getElementById('output');
    div.innerHTML = ''; // 清空之前的內容

    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(500, 200);
    const context = renderer.getContext();
    const stave = new VF.Stave(10, 40, 400);

    const keySignature = document.getElementById('keySignature').value;
    stave.addClef('treble').addKeySignature(keySignature).setContext(context).draw(); // 添加選擇的調號

    const jianpuInput = document.getElementById('jianpuInput').value;
    const notes = jianpuToVexFlow(jianpuInput, keySignature);

    const voice = new VF.Voice({ num_beats: notes.length, beat_value: 4 });
    voice.addTickables(notes);

    const formatter = new VF.Formatter().joinVoices([voice]).format([voice], 400);
    voice.draw(context, stave);
}

function jianpuToVexFlow(jianpu, keySignature) {
    const VF = Vex.Flow;
    const notes = jianpu.split(' ').map((note, index) => {
        let duration = 'q';
        let keys = [];

        if (note === '0') {
            // 休止符
            keys = ['b/4'];
            duration = 'qr';
        } else {
            // 處理高音和低音
            let octave = 4;
            if (note.includes('.')) {
                octave = 5;
                note = note.replace('.', '');
            } else if (note.includes(',')) {
                octave = 3;
                note = note.replace(',', '');
            }
            keys = [noteToKey(note, keySignature, octave)];
        }

	
        const staveNote = new VF.StaveNote({
            keys: keys,
            duration: duration
        });

        // 添加簡譜標記
        staveNote.addModifier(0, new VF.Annotation(note).setFont("Arial", 12).setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM));

        // 添加升降記號
        if (note.includes('#')) {
            staveNote.addAccidental(0, new VF.Accidental('#'));
        } else if (note.includes('b')) {
            staveNote.addAccidental(0, new VF.Accidental('b'));
        }

        return staveNote;
    });
    return notes;
}

function noteToKey(note, keySignature, octave = 4) {
    const keyMappings = {
        'C': { '1': 'c', '2': 'd', '3': 'e', '4': 'f', '5': 'g', '6': 'a', '7': 'b' },
        'G': { '1': 'g', '2': 'a', '3': 'b', '4': 'c', '5': 'd', '6': 'e', '7': 'f#' },
        'D': { '1': 'd', '2': 'e', '3': 'f#', '4': 'g', '5': 'a', '6': 'b', '7': 'c#' },
        'A': { '1': 'a', '2': 'b', '3': 'c#', '4': 'd', '5': 'e', '6': 'f#', '7': 'g#' },
        'E': { '1': 'e', '2': 'f#', '3': 'g#', '4': 'a', '5': 'b', '6': 'c#', '7': 'd#' },
        'B': { '1': 'b', '2': 'c#', '3': 'd#', '4': 'e', '5': 'f#', '6': 'g#', '7': 'a#' },
        'F#': { '1': 'f#', '2': 'g#', '3': 'a#', '4': 'b', '5': 'c#', '6': 'd#', '7': 'e#' },
        'C#': { '1': 'c#', '2': 'd#', '3': 'e#', '4': 'f#', '5': 'g#', '6': 'a#', '7': 'b#' },
        'F': { '1': 'f', '2': 'g', '3': 'a', '4': 'bb', '5': 'c', '6': 'd', '7': 'e' },
        'Bb': { '1': 'bb', '2': 'c', '3': 'd', '4': 'eb', '5': 'f', '6': 'g', '7': 'a' },
        'Eb': { '1': 'eb', '2': 'f', '3': 'g', '4': 'ab', '5': 'bb', '6': 'c', '7': 'd' },
        'Ab': { '1': 'ab', '2': 'bb', '3': 'c', '4': 'db', '5': 'eb', '6': 'f', '7': 'g' },
        'Db': { '1': 'db', '2': 'eb', '3': 'f', '4': 'gb', '5': 'ab', '6': 'bb', '7': 'c' },
        'Gb': { '1': 'gb', '2': 'ab', '3': 'bb', '4': 'cb', '5': 'db', '6': 'eb', '7': 'f' },
        'Cb': { '1': 'cb', '2': 'db', '3': 'eb', '4': 'fb', '5': 'gb', '6': 'ab', '7': 'bb' }
    };

    const mapping = keyMappings[keySignature] || keyMappings['C'];
    return mapping[note.replace('#', '').replace('b', '')] + '/' + octave;
}

function playMIDI() {
    const jianpuInput = document.getElementById('jianpuInput').value;
    const keySignature = document.getElementById('keySignature').value;
    const notes = jianpuToVexFlow(jianpuInput, keySignature);

    const synth = new Tone.Synth().toDestination();
    const now = Tone.now();
    notes.forEach((note, index) => {
        if (note.keys[0] !== 'b/4') { // 跳過休止符
            const midiNote = note.keys[0].replace('/', '');
            synth.triggerAttackRelease(midiNote, '8n', now + index * 0.5);
        }
    });
}
