<div class="col-md-6 centered">
    <h2>Select files for upload</h2>
    <div class="row bottom-space">
        <form>
            <div class="input-group">
                <input
                        type="file"
                        id="filesUploader"
                        name="files[]"
                        multiple
                        class="form-control"
                        (change)="filesSelectionHandler($event)"
                >
            <span class="input-group-btn">
                <button
                        type="submit"
                        class="btn btn-default"
                        (click)="filesUploadHandler($event)"
                >Upload</button>
            </span>
            </div>
        </form>
    </div>
    <div class="row">
        <progress-bar *ngIf="progressBarVisibility" [progress]="uploadProgress"></progress-bar>
    </div>
    <div class="row">
        <h4 *ngIf="files.length">Selected files:</h4>
        <ul class="list-group">
            <li *ngFor="let file of files" class="list-group-item">
                @{{ file.name }}
            </li>
        </ul>
    </div>
</div>