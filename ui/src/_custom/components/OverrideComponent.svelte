<script>
    /**
     * @file OverrideComponent
     * This file allow Components to be override by collection name
     * Allow us to define components overriden by collection names with the directory structure :
     *      * - components/
     *   - overrides/
     *     - users/base/
     *       - idLabel.svelte # Override label when display in relation columns
     *     - members/base/
     *       - idLabel.svelte # Override label when display in relation columns
     *
     *  It provide a way to override components by collection with a minimal impact on code allowing to merge update
     *
     * @example <OverrideComponent path="./base/IdLabel.svelte" props={({id: 154})} collectionName="members" />
     *          Will try to load component located on "@/components/overrides/members/base/IdLabel.svelte"
     *          If exist props will be passed to it
     *          If not the default component located on "@/components/base/IdLabel.svelte" will be used
     *          If the default component not exists an error is displayed
     *
     *
     */
    import { onMount } from 'svelte';
    import Cache from "@/_custom/Cache.js";

    export let collectionId = null;
    export let collection = null;
    let _coll = collection;
    export let path;
    export let props;
    let overridePath;
    let comp;
    let error;
    onMount(async () => {
        console.log('onMount', {collection, collectionId})
        if (!collection && collectionId) {
            _coll = (await Cache.getCollection(collectionId)).name;
        }
        else if (collection) {
            _coll = collection;
        }
        overridePath = path.replace(/^components\//, `./overrides/${_coll}/`)
        console.log({overridePath});
        comp = await import(overridePath)
            .then(p => {
                console.log('path loaded', overridePath)
                return p.default
            })
            .catch(async e => {
                console.error(e);
                return import(path.replace(/^components\//, '../../components/'))
                    .then(p => {
                        console.log('path loaded', path)
                        return p.default
                    })
                    .catch(e => {
                        error = e;
                    })
            })
    })
</script>
{#if comp}
<svelte:component this={comp} {...props} />
{:else}
    <slot>
        {#if error}
            <span class="label label-danger">{error}</span>
        {:else}
            <i class="loader"></i>
        {/if}
    </slot>
{/if}

<style lang="scss">
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
