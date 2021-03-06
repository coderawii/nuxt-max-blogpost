// import axios from 'axios'

const state = () => ({ //! kaze Nuxt da state treba da bude f-ja!!
	loadedPosts: []
})

const getters = {
	LOADED_POSTS(state) {
		return state.loadedPosts
	} 
}

const mutations = {
	SET_POSTS(state, posts) { // posts je Array
		state.loadedPosts = posts
	},

	ADD_POST(state, post) {
		state.loadedPosts.push(post)
	},
	
	EDIT_POST(state, editedPost) {
		// replace existing post with updated version, dakle prvo moramo da nadjemo index postojeceg posta i loadedPosts nizu:
		const postIndex = state.loadedPosts.findIndex(post => post.id === editedPost.id)
		state.loadedPosts[postIndex] = editedPost // i kad smo nasli u loadedPosts nizu post sa trazecim indexom, onda ga selektujemo sa state.loadedPosts[postIndex] i stavljamo da je jednak ovom editovanom postu

	}
}

const actions = {
	// nuxtServerInit(vuexContext, context) { // inicijalizovanje stora, da ne moramo na svakoj stranici da pozivamo metod vec samo ovde i jednom nuxtServerInit
	// 	// if (!process.client) {
	// 	// 	console.log(context.req)
	// 	// }

	// 	return new Promise((resolve, reject) => {
	// 		setTimeout(() => {
	// 			vuexContext.commit('SET_POSTS', [
	// 				{
	// 					id: "1",
	// 					title: "First Post",
	// 					previewText: "This is our first post!",
	// 					thumbnail:
	// 						"https://static.pexels.com/photos/270348/pexels-photo-270348.jpeg"
	// 				},
	// 				{
	// 					id: "2",
	// 					title: "Second Post",
	// 					previewText: "This is our second post!",
	// 					thumbnail:
	// 						"https://static.pexels.com/photos/270348/pexels-photo-270348.jpeg"
	// 				}
	// 			])
	// 			resolve()
	// 		}, 1000)
	// 			// reject(new Error()) // ako dodje do errora prikaze se ona error.vue page zbog ovog dole catch-a context.error(e)
	// 	})
	// 	// .then(data => {
	// 	// 	// return data 
	// 	// 	context.store.commit('SET_POSTS', data.loadedPosts) // dohvata prekonfigurisan store nasoj stranici kada je ucitavamo prvi x ili .... npm mrzi me
	// 	// })
	// 	// .catch(e => {
	// 	// 	context.error(e);
	// 	// })
	// },

	nuxtServerInit(vuexContext, context) {
		return context.app.$axios
			.$get('/posts.json') //! i sada mozemo da obrisemo ovo ${process.env.baseUrl} jer smo stavili u axios module baseURL i on automatski povlaci odatle adresu. primetimo da koristimo $get a ne get, i context.app.$axios a ne axios
			.then(data => {
				const postsArray = [] // definisemo postsArray kao niz, i onda lupujemo kroz sve keys u nasem data objektu koji se nalazi u res
				for (const key in data) {
					// postsArray.push(res.data[key]) // mozemo i da storujemo i id posta tako sto dodamo spread operator: postsArray.push({ ...res.data[key] })
					//! i sada sa modules axios ne moramo da pristupamo data na res tj responsu, vec mozemo da pristupimo odmah data kao odgovor. i gde god imamo res ili res.data, stavljamo data samo
					postsArray.push({ ...data[key], id: key })
				}

				vuexContext.commit('SET_POSTS', postsArray) // posto za SET_POSTS zahteva da podaci budu Array, moramo da konvertujemo data array
			})
			.catch(e => context.error(e))
	},

	SET_POSTS(vuexContext, posts) { // moze i context al kao da ne bude zbunjujuce moze i vuexContext
		vuexContext.commit('SET_POSTS', posts)
	},

	ADD_POST(vuexContext, postData) {
		const createdPost = {
			...postData, // ovo je iz forme AdminPostForm
			updatedDate: new Date()
		}
		
		return this.$axios
			.$post(`/posts.json?auth=${vuexContext.rootState.auth.token}`, createdPost) // kopiramo adresu iz firebase iz realtime databse i dodajemo na kraju ime node-a koje zelimo, recimo posts, ali moramo i da dodamo ekstenziju .json. drugi argument su podaci koje zelimo da posaljemo ovim rikvestom na tu adresu. onda imamo then() blok jer axios vraca Promise.
				// dodajemo spread operator kod postData da bismo mogli dodati novi obj tj updatedDate: new Date()
			.then(data => {
				// console.log(res)
				vuexContext.commit('ADD_POST', { ...createdPost, id: data.name })
				// this.$router.push('/admin') // ovo vise ovako nece raditi, alio mozemo da dodamo return gore ispred axios, i da onda idemo u pages/new-post/index.vue, dispatcujemo ovaj action ADD_POST i posto on vraca axios, a axios promise, mozemo da chainujemo dalje then() i u taj then() stavimo this.$router.push('/admin')
			})
			.catch(e => console.log(e))

	},

	EDIT_POST(vuexContext, editedPost) { //? sada kada smo dodali authentication, ne mozemo da editujemo post, 401 error tj da nismo authorizovani. da bi to prepravili moramo ovde da attachujemo token (https://firebase.google.com/docs/database/rest/auth), moramo dodati taj auth parametar u odlazeci rikvest url
		// console.log(vuexContext.rootState.auth.token)

		const createdPost = {
			...editedPost, // ovo je iz forme AdminPostForm
			updatedDate: new Date()
		}
		return this.$axios
			.$put(`/posts/${editedPost.id}.json?auth=${vuexContext.rootState.auth.token}`, createdPost) // saljemo put rikvest a ne post jer za edit hocemo da se prethodni post koji editujemo obrise a ostane sad ovo novo editovano
			.then(res => {
				// console.log(res)
				vuexContext.commit('EDIT_POST', createdPost)
				// this.$router.push('/admin')
			})
			.catch(e => console.log(e))
	}
}


const postModule = {
	// namespaced: true,
	state,
	getters,
	actions,
	mutations,
}

export default postModule



//! Note: Whilst using split-file modules, you must remember that using arrow functions, 'this' is only lexically available. Lexical scoping simply means that the 'this' always references the owner of the arrow function. If the arrow function is not contained then 'this' would be undefined. The solution is to use a "normal" function which produces its own scope and thus has 'this' available.