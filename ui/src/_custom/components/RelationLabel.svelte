<script>
    import IdLabel from "@/components/base/IdLabel.svelte";
    import ApiClient from "@/utils/ApiClient";
    import Cache from "@/_custom/Cache.js";
    export let collectionName = null;
    let retry = 0;
    export let autoload = false;
    export let id = "";
    export let collectionId = "";
    export let field = "id";

    async function cancelRequests(id, collectionId) {
        await ApiClient.cancelRequest(`${collectionId}-${id}`);
    }
    async function getRelatedRecord(id, collectionId) {
        if (!collectionName) {
            const collection = await Cache.getCollection(collectionId);
            collectionName = collection.name;
        }
        return await ApiClient.collection(collectionName).getOne(id, {'$autoCancel': false});
    }

    let shortId = id;

    $: if (typeof id === "string" && id.length > 27) {
        shortId = id.substring(0, 5) + "..." + id.substring(id.length - 10);
    }
</script>
{#if autoload}
    {#key collectionName + id+retry}
        {#await getRelatedRecord(id, collectionId)}
            {#if id}
                <span class="label txt-base txt-mono" title={id}>{shortId} <i class="loader"></i></span>
            {:else}
                <span class="txt txt-hint">N/A</span>
            {/if}
        {:then row}
                <span class="label txt-base txt-mono" title={id}>
                    <slot {row}>
                        <IdLabel id={id} />
                    </slot>
                </span>
        {:catch error}
            <IdLabel id={id} />
            <button class="label label-danger" type="button" on:click|preventDefault|stopPropagation|capture={() => retry++}>error {error}</button>
        {/await}
    {/key}
{:else}

    <button class="button-loader" type="button" on:click|capture|stopPropagation|preventDefault={() => autoload = true}>
        {#if id}
            <span class="label txt-base txt-mono" title={id}>{shortId}</span>
        {:else}
            <span class="txt txt-hint">N/A</span>
        {/if}

    </button>
{/if}

<style lang="scss">
    .button-loader .label {
        cursor: pointer;
        &:hover {
            background-color: var(--infoAltColor);
        }
    }
    // loading
    .loader {
          --loaderSize: 20px;

          cursor: default;
          pointer-events: none;

          &:after {
            content: "\eec4";
            position: absolute;
            display: inline-block;
            vertical-align: top;
            left: 50%;
            top: 50%;
            width: var(--loaderSize);
            height: var(--loaderSize);
            line-height: var(--loaderSize);
            font-size: var(--loaderSize);
            font-weight: normal;
            color: inherit;
            text-align: center;
            font-weight: normal;
            margin-left: (calc(var(--loaderSize) * -0.5));
            margin-top: (calc(var(--loaderSize) * -0.5));
            font-family: var(--iconFontFamily);
            animation: loaderShow var(--baseAnimationSpeed),
            rotate 0.9s var(--baseAnimationSpeed) infinite linear;
          }
    }
</style>
