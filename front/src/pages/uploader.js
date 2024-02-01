export default function Uploader() {
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  // };
  return (
    <div>
      <h1>Update data here </h1>
      <form
        method="POST"
        action="http://localhost:8000/upload"
        id="upload-form"
        enctype="multipart/form-data"
        onSubmit={(e) => e.preventDefault()}
      >
        <div class="form-group">
          <div class="row my-3">
            <div class="col-1">
              <label class="form-label" for="file">
                File
              </label>
            </div>
            <div class="col-4">
              <input
                class="form-control"
                id="corpus"
                name="corpus"
                type="file"
                required
              />
            </div>
          </div>
          <div class="row my-3">
            <div class="col-1">
              <label class="form-label" for="corpusname">
                Name
              </label>
            </div>
            <div class="col-3">
              <input
                class="form-control"
                id="corpusname"
                type="text"
                name="corpusname"
                required
              ></input>
            </div>
          </div>

          <div class="my-3">
            <div class="form-check-inline">
              <label class="form-label" for="corpus-format">
                Corpus format
              </label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                name="corpus-format"
                id="corpus-format-tsv"
                value="tsv"
                checked
              />
              <label class="form-check-label" for="corpus-format-tsv">
                TSV
              </label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                name="corpus-format"
                id="corpus-format-tmx"
                value="tmx"
              />
              <label class="form-check-label" for="corpus-format-tmx">
                TMX
              </label>
            </div>
          </div>

          <div class="my-3">
            <div class="form-check-inline">
              <label class="form-label" for="lang-format">
                Language
              </label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                name="lang-format"
                id="lang-format-mono"
                value="mono"
              />
              <label class="form-check-label" for="lang-format-mono">
                Mono
              </label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                name="lang-format"
                id="lang-format-parallel"
                value="parallel"
                checked
              />
              <label class="form-check-label" for="lang-format-parallel">
                Parallel
              </label>
            </div>
          </div>
          {/* <div class="row my-3">
            <div class="label-holder">
              <label class="form-label" for="srclang">
                Source language
              </label>
            </div>
            <div class="input-holder">
              <select
                name="srclang"
                id="srclang"
                class="form-select"
                required
              ></select>
            </div>
            <div class="label-holder">
              <label class="form-label" for="trglang">
                Target language
              </label>
            </div>
            <div class="input-holder">
              <select name="trglang" id="trglang" class="form-select"></select>
            </div>
          </div> */}
          <div class="row my-3">
            <div class="button-holder">
              <button
                class="btn btn-primary"
                type="submit"
                form="upload-form"
                id="myAnchor"
              >
                Upload
              </button>
            </div>
            <div class="button-holder-2">
              <button
                id="getcmd-button"
                class="btn btn-secondary"
                type="button"
                form="upload-form"
              >
                Get cmd
              </button>
            </div>
            <div class="button-holder-3">
              <a class="btn btn-dark" href="./viewer.html">
                Go to viewer
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
