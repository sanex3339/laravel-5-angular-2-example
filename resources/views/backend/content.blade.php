@extends('backend.layout')

@section('backend.content')
    <banners-creator>
        @include('backend.loading')
    </banners-creator>

    @include('backend.scripts-import')
@stop