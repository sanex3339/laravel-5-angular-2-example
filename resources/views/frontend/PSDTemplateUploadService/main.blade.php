<div class="col-md-6 centered">
    <h2>Выберите PSD макеты для загрузки</h2>
    <div class="row bottom-space">
        <form>
            <div class="input-group">
                <input
                        accept=".psd"
                        type="file"
                        id="psdTemplatesUploader"
                        name="psdTemplates[]"
                        multiple
                        class="form-control"
                        (change)="psdTemplateSelectionHandler($event)"
                >
            <span class="input-group-btn">
                <button
                        type="submit"
                        class="btn btn-default"
                        (click)="psdTemplateUploadHandler($event)"
                >Загрузить</button>
            </span>
            </div>
        </form>
    </div>
    <div class="row">
        <progress-bar *ngIf="progressBarVisibility" [progress]="uploadProgress"></progress-bar>
    </div>
    <div class="row">
        <h4 *ngIf="psdTemplates.length">Выбранные макеты:</h4>
        <ul class="list-group">
            <li *ngFor="#template of psdTemplates" class="list-group-item">
                @{{ template.name }}
            </li>
        </ul>
    </div>
</div>