<template>
	<div class="single-post-page">
		<section class="post">
			<h1 class="title">{{ loadedPost.title }}</h1>

			<div class="post-details">
				<div class="post-detail">Last updated on {{ loadedPost.updatedDate | date }}</div>
				<div class="post-detail">written by {{ loadedPost.author }}</div>
			</div>

			<p>{{ loadedPost.content }}</p>
		</section>

		<section class="post-feedback">
			<p>Let me know what you think about post, send me mail to <a href="mailto:feedback@my-awesome-domain.com"> feedback@my-awesome-domain.com </a></p>
		</section>
	</div>
</template>

<script>
// import axios from 'axios'

export default {
	// asyncData(context, callback) {
	// 	setTimeout(() => {
	// 		callback(null, {
	// 			loadedPost: { // i sada je ovo loadedPost dostupno u nasoj komponenti zbog asyncData()
	// 				id: '1',
	// 				title: `Single post (ID: ${context.params.id})`, // ovo mu dodje kao this.$route.params.id, ali ovde naravno ne mozemo da koristimo this jer komponenta jos nije kreirana, mozemo i duzu verziju tj context.route.params.id
	// 				previewText: 'This is out one single post!',
	// 				author: 'Maximilian',
	// 				updatedDate: new Date(),
	// 				thumbnail: 'https://static.pexels.com/photos/270348/pexels-photo-270348.jpeg',
	// 				content: 'Some dummy text which is definitely not the preview text though!'
	// 			}
	// 		})
	// 	}, 1000);
	// }

	asyncData(context) {
		if(context.payload) { // chekiramo da li context ima payload properrty (onaj koji smo setovali u nuxt.config.js u generate) i ako je to slucaj zelim da vratim nove data. npm, ali ovi mopet pregenerisemo sve fajlove samo sa manje http rikvestova 
			return {
				loadedPost: context.payload.postData
			}
		}

		return context.app.$axios.$get(`/posts/${context.params.id}.json`)
			.then(data => { // preko axios modules imamo samo data, a ne res pa u njemu data
				return {
					loadedPost: data
				}
			})
			.catch(e => context.error(e))
	},

	head: {
		title: 'A Blog Post'
	}
}
</script>

<style scoped>
	.single-post-page {
  padding: 30px;
  text-align: center;
  box-sizing: border-box;
}

.post {
  width: 100%;
}

@media (min-width: 768px) {
  .post {
    width: 600px;
    margin: auto;
  }
}

.post-title {
  margin: 0;
}

.post-details {
  padding: 10px;
  box-sizing: border-box;
  border-bottom: 3px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

@media (min-width: 768px) {
  .post-details {
    flex-direction: row;
  }
}

.post-detail {
  color: rgb(88, 88, 88);
  margin: 0 10px;
}

.post-feedback a {
  color: red;
  text-decoration: none;
}

.post-feedback a:hover,
.post-feedback a:active {
  color: salmon;
}
</style>