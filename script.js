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

    // 生成 MIDI
    generateMIDI(jianpuInput, keySignature);
}

function jianpuToVexFlow(jianpu, keySignature) {
    const VF = Vex.Flow;
    const notes = jianpu.split(' ').map((note, index) => {
        const staveNote = new VF.StaveNote({
            keys: [noteToKey(note, keySignature)],
            duration: 'q'
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

function noteToKey(note, keySignature) {
    const keyMappings = {
        'C': { '1': 'c/4', '2': 'd/4', '3': 'e/4', '4': 'f/4', '5': 'g/4', '6': 'a/4', '7': 'b/4' },
        'G': { '1': 'g/4', '2': 'a/4', '3': 'b/4', '4': 'c/5', '5': 'd/5', '6': 'e/5', '7': 'f#/5' },
        'D': { '1': 'd/4', '2': 'e/4', '3': 'f#/4', '4': 'g/4', '5': 'a/4', '6': 'b/4', '7': 'c#/5' },
        'A': { '1': 'a/4', '2': 'b/4', '3': 'c#/5', '4': 'd/5', '5': 'e/5', '6': 'f#/5', '7': 'g#/5' },
        'E': { '1': 'e/4', '2': 'f#/4', '3': 'g#/4', '4': 'a/4', '5': 'b/4', '6': 'c#/5', '7': 'd#/5' },
        'B': { '1': 'b/4', '2': 'c#/5', '3': 'd#/5', '4': 'e/5', '5': 'f#/5', '6': 'g#/5', '7': 'a#/5' },
        'F#': { '1': 'f#/4', '2': 'g#/4', '3': 'a#/4', '4': 'b/4', '5': 'c#/5', '6': 'd#/5', '7': 'e#/5' },
        'C#': { '1': 'c#/4', '2': 'd#/4', '3': 'e#/4', '4': 'f#/4', '5': 'g#/4', '6': 'a#/4', '7': 'b#/4' },
        'F': { '1': 'f/4', '2': 'g/4', '3': 'a/4', '4': 'bb/4', '5': 'c/5', '6': 'd/5', '7': 'e/5' },
        'Bb': { '1': 'bb/4', '2': 'c/5', '3': 'd/5', '4': 'eb/5', '5': 'f/5', '6': 'g/5', '7': 'a/5' },
        'Eb': { '1': 'eb/4', '2': 'f/4', '3': 'g/4', '4': 'ab/4', '5': 'bb/4', '6': 'c/5', '7': 'd/5' },
        'Ab': { '1': 'ab/4', '2': 'bb/4', '3': 'c/5', '4': 'db/5', '5': 'eb/5', '6': 'f/5', '7': 'g/5' },
        'Db': { '1': 'db/4', '2': 'eb/4', '3': 'f/4', '4': 'gb/4', '5': 'ab/4', '6': 'bb/4', '7': 'c/5' },
        'Gb': { '1': 'gb/4', '2': 'ab/4', '3': 'bb/4', '4': 'cb/5', '5': 'db/5', '6': 'eb/5', '7': 'f/5' },
        'Cb': { '1': 'cb/4', '2': 'db/4', '3': 'eb/4', '4': 'fb/4', '5': 'gb/4', '6': 'ab/4', '7': 'bb/4' }
    };

    const mapping = keyMappings[keySignature] || keyMappings['C'];
    return mapping[note.replace('#', '').replace('b', '')] || 'c/4';
}

function generateMIDI(jianpu, keySignature) {
    const midi = new Midi();
    const track = new Track();
    midi.addTrack(track);

    const keyMappings = {
        'C': { '1': 60, '2': 62, '3': 64, '4': 65, '5': 67, '6': 69, '7': 71 },
        'G': { '1': 67, '2': 69, '3': 71, '4': 72, '5': 74, '6': 76, '7': 78 },
        'D': { '1': 62, '2': 64, '3': 66, '4': 67, '5': 69, '6': 71, '7': 73 },
        'A': { '1': 69, '2': 71, '3': 73, '4': 74, '5': 76, '6': 78, '7': 80 },
        'E': { '1': 64, '2': 66, '3': 68, '4': 69, '5': 71, '6': 73, '7': 75 },
        'B': { '1': 71, '2': 73, '3': 75, '4': 76, '5': 78, '6': 80, '7': 82 },
        'F#': { '1': 66, '2': 68, '3': 70, '4': 71, '5': 73, '6': 75, '7': 77 },
        'C#': { '1': 61, '2': 63, '3': 65, '4': 66, '5': 68, '6': 70, '7': 72 },
        'F': { '1': 65, '2': 67, '3': 69, '4': 70, '5': 72, '6': 74, '7': 76 },
        'Bb': { '1': 70, '2': 72, '3': 74, '4': 75, '5': 77, '6': 79, '7': 81 },
        'Eb': { '1': 63, '2': 65, '3': 67, '4': 68, '5': 70, '6': 72, '7': 74 },
        'Ab': { '1': 68, '2': 70, '3': 72, '4': 73, '5': 75, '6': 77, '7': 79 },
        'Db': { '1': 61, '2': 63, '3': 65, '4': 66, '5': 68, '6': 70, '7': 72 },
        'Gb': { '1': 66, '2': 68, '3': 70, '4': 71, '5': 73, '6': 75, '7': 77 },
        'Cb': { '1': 59, '2': 61, '3': 63, '4': 64, '5': 66, '6': 68, '7': 70 }
    };

    const mapping = keyMappings[keySignature] || keyMappings['C'];
    const notes = jianpu.split(' ');

    notes.forEach(note => {
        const midiNote = mapping[note.replace('#', '').replace('b', '')];
        if (midiNote) {
            track.addEvent(new NoteEvent({ pitch: [midiNote], duration: 64 }));
        }
    });

    const midiData = midi.toBytes();
    const blob = new Blob([new Uint8Array(midiData)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
}
