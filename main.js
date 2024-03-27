const cedict_words = new Array();
const canto_words = new Array();

onload = (e) => {
	// console.log('hi');
	fetch('/cedict_1_0_ts_utf-8_mdbg.txt')
		.then(response => response.text())
		.then((cedict) => {
			// console.log(cedict)
			fetch('/cccedict-canto-readings-150923.txt')
				.then(response => response.text())
				.then((canto) => {
					// console.log(canto);


					for (const line of cedict.split('\n')) {
						if (!line.trim()) {
							continue;
						}
						if (line.startsWith('#')) {
							// console.log(line);
							continue;
						}

						const lsplit = line.split(' ');
						let a = lsplit.splice(0, 2);
						const trad = a[0];
						const simp = a[1];
						const cedict_rest = lsplit.join(' ');
						// console.log(trad, simp, cedict_rest);

						if (!cedict_rest.startsWith('[')) {
							console.log("BAD", trad, simp, cedict_rest);
							continue;
						}

						let end_pinyin = cedict_rest.indexOf(']');
						if (end_pinyin == -1) {
							console.log("BAD", trad, simp, cedict_rest);
							continue;
						}

						const pinyin = cedict_rest.substring(1, end_pinyin);
						// console.log(pinyin);
						const definitions = cedict_rest.substring(end_pinyin + 2);
						// console.log(definitions);

						if (!definitions.startsWith('/')) {
							console.log("BAD", trad, simp, definitions);
							continue;
						}

						let definitions_arr = definitions.split('/').splice(1);
						if (definitions_arr[definitions_arr.length - 1].trim()) {
							console.log("BAD", trad, simp, definitions_arr[definitions_arr.length - 1]);
							continue;
						}
						definitions_arr = definitions_arr.splice(0, definitions_arr.length - 1);
						// console.log(definitions_arr);

						cedict_words.push([trad, simp, pinyin, definitions_arr]);
					}

					console.log(cedict_words);

					for (const line of canto.split('\n')) {
						if (!line.trim()) {
							continue;
						}
						if (line.startsWith('#')) {
							// console.log(line);
							continue;
						}

						const lsplit = line.split(' ');
						let a = lsplit.splice(0, 2);
						const trad = a[0];
						const simp = a[1];
						const canto_rest = lsplit.join(' ');
						// console.log(trad, simp, canto_rest);

						if (!canto_rest.startsWith('[')) {
							console.log("BAD", trad, simp, canto_rest);
							continue;
						}

						let end_pinyin = canto_rest.indexOf(']');
						if (end_pinyin == -1) {
							console.log("BAD", trad, simp, canto_rest);
							continue;
						}

						const pinyin = canto_rest.substring(1, end_pinyin);
						// console.log(pinyin);
						const jyutping = canto_rest.substring(end_pinyin + 2).trim();
						// console.log(jyutping);

						if (!jyutping.startsWith('{') || !jyutping.endsWith('}')) {
							console.log("BAD", trad, simp, jyutping);
							continue;
						}

						canto_words.push([trad, simp, pinyin, jyutping.substring(1, jyutping.length - 1)]);
					}

					console.log(canto_words);
				});
		});

	document.getElementById('searchform').addEventListener('submit', search);
	document.getElementById('gobutton').addEventListener('click', make_card);
};

function search(e) {
	// console.log(e);
	e.preventDefault();

	const searchword = document.getElementById('searchbox').value;
	// console.log(searchword);

	const cedict_matches = cedict_words.filter((x) => x[0] == searchword || x[1] == searchword);
	const canto_matches = canto_words.filter((x) => x[0] == searchword || x[1] == searchword);
	// console.log(cedict_matches);
	// console.log(canto_matches);

	const simp = new Set();
	const trad = new Set();
	const pinyin = new Set();
	const jyutping = new Set();
	const english = new Set();
	for (const x of cedict_matches) {
		simp.add(x[1]);
		trad.add(x[0]);
		pinyin.add(x[2]);
		for (const en of x[3]) {
			english.add(en);
		}
	}
	for (const x of canto_matches) {
		// simp.add(x[1]);
		// trad.add(x[0]);
		// pinyin.add(x[2]);
		// for (const en of x[3]) {
		// 	english.add(en);
		// }
		if (!simp.has(x[1])) {
			console.log("WARN");
		}
		if (!trad.has(x[0])) {
			console.log("WARN");
		}
		if (!pinyin.has(x[2])) {
			console.log("WARN");
		}
		jyutping.add(x[3]);
	}

	let simp_inp = document.getElementById('simp');
	simp_inp.innerHTML = '';
	for (const x of simp) {
		// console.log(x);
		let opt = document.createElement('option');
		opt.value = opt.innerHTML = x;
		simp_inp.appendChild(opt);
	}
	simp_inp.selectedIndex = 0;

	let trad_inp = document.getElementById('trad');
	trad_inp.innerHTML = '';
	for (const x of trad) {
		// console.log(x);
		let opt = document.createElement('option');
		opt.value = opt.innerHTML = x;
		trad_inp.appendChild(opt);
	}
	trad_inp.selectedIndex = 0;

	let pinyin_inp = document.getElementById('pinyin');
	pinyin_inp.innerHTML = '';
	for (const x of pinyin) {
		// console.log(x);
		let opt = document.createElement('option');
		opt.value = opt.innerHTML = x;
		pinyin_inp.appendChild(opt);
	}
	pinyin_inp.selectedIndex = 0;

	let jyutping_inp = document.getElementById('jyutping');
	jyutping_inp.innerHTML = '';
	for (const x of jyutping) {
		// console.log(x);
		let opt = document.createElement('option');
		opt.value = opt.innerHTML = x;
		jyutping_inp.appendChild(opt);
	}
	jyutping_inp.selectedIndex = 0;

	let en_inp = document.getElementById('english');
	en_inp.innerHTML = '';
	{
		let opt = document.createElement('option');
		opt.value = opt.innerHTML = "~CUSTOM~";
		en_inp.appendChild(opt);
	}
	for (const x of english) {
		// console.log(x);
		let opt = document.createElement('option');
		opt.value = opt.innerHTML = x;
		en_inp.appendChild(opt);
	}
	en_inp.selectedIndex = 1;
}

function make_card(e) {
	// console.log("MAKE!");

	let simp = document.getElementById('simp').selectedOptions;
	if (simp.length != 1) {
		console.log("BAD SEL");
		return;
	}
	simp = simp[0].value;
	// console.log(simp);

	let trad = document.getElementById('trad').selectedOptions;
	if (trad.length != 1) {
		console.log("BAD SEL");
		return;
	}
	trad = trad[0].value;
	// console.log(trad);

	let pinyin = document.getElementById('pinyin').selectedOptions;
	if (pinyin.length != 1) {
		console.log("BAD SEL");
		return;
	}
	pinyin = pinyin[0].value;
	// console.log(pinyin);

	let jyutping = document.getElementById('jyutping').selectedOptions;
	if (jyutping.length != 1) {
		console.log("BAD SEL");
		return;
	}
	jyutping = jyutping[0].value;
	// console.log(jyutping);

	let english = document.getElementById('english').selectedOptions;
	if (english.length != 1) {
		console.log("BAD SEL");
		return;
	}
	english = english[0].value;
	if (english == "~CUSTOM~") {
		english = document.getElementById('customenglish').value;
		if (!english) {
			console.log("BAD CUSTOM!");
			return;
		}
	}
	// console.log(english);

	console.log(simp, trad, pinyin, jyutping, english);

	const card_back_content = pinyin + "<br>" + jyutping + "<br>" + english;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", "http://127.0.0.1:8765");
	xhr.send(JSON.stringify({
		"action": "addNote",
		"version": 6,
		"params": {
			"note": {
				"deckName": "zh",
				"modelName": "Basic",
				"fields": {
					"Front": simp,
					"Back": card_back_content
				},
			},
		},
	}));
	if (simp != trad) {
		let xhr = new XMLHttpRequest();
		xhr.open("POST", "http://127.0.0.1:8765");
		xhr.send(JSON.stringify({
			"action": "addNote",
			"version": 6,
			"params": {
				"note": {
					"deckName": "zh",
					"modelName": "Basic",
					"fields": {
						"Front": trad,
						"Back": card_back_content
					},
				},
			},
		}));
	}
}
