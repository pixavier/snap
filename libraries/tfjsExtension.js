/* tfjs_Extension.js - add TensorFlow JS to Snap!
 * ===========================================
 */


SnapExtensions.primitives.set(
	'tfj_loadmodel(modelFile, modelName)',
	async function (modelFile, modelName) {
		let stage = this.parentThatIsA(StageMorph);
		window.tfStage = stage;

		if (!stage._tfjs) {
			stage._tfjs = {};
		} 

		if (!stage._tfjs.models) {
			stage._tfjs.models = {};
		} 

		try {
			if (!modelFile) {
				stage._tfjs.models[modelName] = undefined;
			} else {
				stage._tfjs.models[modelName] = await tf.loadLayersModel(modelFile);
			}
		} catch (e) {
			console.log(e);
		}
	}
);


SnapExtensions.primitives.set(
	'tfj_tm_loadmodel_img(modelFile, modelMetadata, modelName)',
	async function (modelFile, modelMetadata, modelName) {
		let stage = this.parentThatIsA(StageMorph);
		window.tfStage = stage;

		if (!stage._tmjs) {
			stage._tmjs = {};
		} 

		if (!stage._tmjs.models) {
			stage._tmjs.models = {};
		} 

		if (!modelFile) {
			stage._tmjs.models[modelName] = undefined;
		} else {
			stage._tmjs.models[modelName] = await tmImage.load(modelFile, modelMetadata);
		}
	}
);


SnapExtensions.primitives.set(
	'tfj_predict(modelName, shape, ...params)',
	function (modelName, shape, ...params) {
		let res = '';
		let param;
		let stage = this.parentThatIsA(StageMorph);
		let args = params[0].contents;

		if (stage._tfjs.models[modelName]) {
			let tensorParams = [];
			let n = args.length;
			for (let i = 0; i < n; i++) {
				param = args[i];
				if (!isNaN(param)) {
					let x = parseFloat(param);
					tensorParams.push(x);
				} else if (typeof param == 'string') {
					tensorParams.push(param);
				}
			}

			let t = tf.tensor(tensorParams);
			let par;
			if (shape) {
				try {
					par = tf.reshape(t, eval(shape));
				} catch (e) {
					console.log(e);
				}
			} else {
				par = t;
			}
			res = stage._tfjs.models[modelName].predict(par);
		}
		
		return res.arraySync();	
	}
);


SnapExtensions.primitives.set(
	'tfj_tm_predict_img(modelName, param)',
	function (modelName, param) {
		
		let stage = this.parentThatIsA(StageMorph);

		if (!stage._tmjs.semaphores) {
			stage._tmjs.semaphores = [];
		} 
		
		if (!stage._tmjs.semaphores['tfj_tm_predict_img']) {
			stage._tmjs.semaphores['tfj_tm_predict_img'] = {};
		} 
		
		stage._tmjs.semaphores['tfj_tm_predict_img'].value = 0;
		stage._tmjs.semaphores['tfj_tm_predict_img'].result = '';
		
		let model = stage._tmjs.models[modelName];

		if (model) {
			window._tfParam = param;	
			
			model.predict(param.contents).then (prediction => {
//				console.log(prediction);
				stage._tmjs.semaphores['tfj_tm_predict_img'].result = JSON.stringify(prediction);
				stage._tmjs.semaphores['tfj_tm_predict_img'].value = 1;
			}).catch (error => {
				console.log('error ' + error);
				stage._tmjs.semaphores['tfj_tm_predict_img'].value = 1;
			});
		}
	}
);


SnapExtensions.primitives.set(
	'tfj_get_semaphore_value(semaphoreName)',
	function (semaphoreName) {
		let stage = this.parentThatIsA(StageMorph);
		return stage._tmjs.semaphores[semaphoreName].value;	
	}
);

SnapExtensions.primitives.set(
	'tfj_get_semaphore_result(semaphoreName)',
	function (semaphoreName) {
		let stage = this.parentThatIsA(StageMorph);
		return stage._tmjs.semaphores[semaphoreName].result;	
	}
);

