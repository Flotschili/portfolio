<svelte:head>
	<title>Home</title>
	<meta name="description" content="Flotschis Svelte page" />
</svelte:head>

<section class="centered">
	<img src="/images/oia-uia.gif" alt="oia-uia" />
    <h1>Gugu Gaga</h1>
</section>

<style>
	.centered {
		display: flex;
		flex-direction: column; /* stack headline and image vertically */
		justify-content: center; /* vertical center */
		align-items: center;     /* horizontal center */
		min-height: 100vh;       /* take full viewport height */
		text-align: center;
	}
</style>