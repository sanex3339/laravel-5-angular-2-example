<?php

namespace BannersCreator\Services;

use Imagick;
use File;

class PSDParser
{
    const PSD_EXTENSION = 'psd';
    const IMAGE_EXTENSION = 'png';

    const LOGO_LAYER_NAME = 'logo';

    /**
     * @var array
     */
    private $convertedFiles = [];

    /**
     * @var \Symfony\Component\HttpFoundation\File\UploadedFile|array|null
     */
    private $files;

    /**
     * @var string
     */
    private $sourcePath;

    /**
     * @var string
     */
    private $destinationPath;

    /**
     * PSDParser constructor.
     * @param $files
     * @param $sourcePath
     */
    public function __construct($files, $sourcePath)
    {
        $this->files = $files;
        $this->sourcePath = $sourcePath;
        $this->destinationPath = base_path() . '/public/processed-images/';
    }

    public function getConvertedFileNames()
    {
        return $this->convertedFiles;
    }

    /**
     *  Start parsing of PSD files
     */
    public function parse()
    {
        File::cleanDirectory($this->destinationPath);

        if (!File::exists($this->destinationPath)) {
            File::makeDirectory($this->destinationPath);
        }

        foreach ($this->files as $file)
        {
            if ($file->getClientOriginalExtension() !== PSDParser::PSD_EXTENSION)
            {
                continue;
            }

            $this->convertPSDFile($file);
            $this->convertedFiles[] = $this->getOutputImageName($file);
        }
    }

    /**
     * Converting of a single PSD file to jpg.
     * Converting split into two stages:
     *  - finding and converting logo into separate image;
     *  - converting all layers into another image;
     *
     * @param $file
     */
    private function convertPSDFile($file) {
        $imageName = $this->getOutputImageName($file);

        $this->saveImage(
            $this->getPSDLogoLayer($file),
            $this->getOutputDirectory($imageName),
            PSDParser::LOGO_LAYER_NAME
        );

        $this->saveImage(
            $this->getFullPSD($file),
            $this->getOutputDirectory($imageName),
            $imageName
        );
    }

    /**
     * Get output directory in which image must saved
     *
     * @param $imageName
     * @return string
     */
    private function getOutputDirectory($imageName)
    {
        return $this->destinationPath . $imageName . '/';
    }

    /**
     * Returns image name with based on PSD name with image extension
     *
     * @param $file
     * @return string
     */
    private function getOutputImageName($file) {
        return pathinfo($file->getClientOriginalName())['filename'];
    }

    /**
     * Return Imagick object with logo layer
     *
     * @param $file
     * @return Imagick
     */
    private function getPSDLogoLayer($file)
    {
        $inputImage = new Imagick($this->sourcePath . $file->getClientOriginalName());
        $outputImage = new Imagick();

        $hasLogoFlag = false;

        $layersCount = $inputImage->getNumberImages();

        for ($i = 0; $i < $layersCount; $i++) {
            $inputImage->setIteratorIndex($i);

            $imageLabelProperty = $inputImage->getImageProperties("label");

            if (!count($imageLabelProperty)) {
                continue;
            }

            $imageLabel = $imageLabelProperty['label'];

            if (stristr($imageLabel, PSDParser::LOGO_LAYER_NAME) === false) {
                continue;
            }

            $hasLogoFlag = true;

            $outputImage->addImage($inputImage->getimage());

            $layerData = $outputImage->getImagePage();
            $outputImage->setImagePage($layerData['width'], $layerData['height'], 0, 0);

            break;
        }

        if (!$hasLogoFlag) {
            return new Imagick();
        }

        return $outputImage;
    }

    /**
     * Return copy of initial Imagick object
     *
     * @param $file
     * @return Imagick
     */
    private function getFullPSD($file)
    {
        $inputImage = new Imagick($this->sourcePath . $file->getClientOriginalName());
        $outputImage = clone $inputImage;

        return $outputImage;
    }

    /**
     * Saving image into directory
     *
     * @param Imagick $outputImage
     * @param $outputDirectory
     * @param $imageName
     */
    private function saveImage(Imagick $outputImage, $outputDirectory, $imageName)
    {
        if (!$outputImage->count()) {
            return;
        }

        if (!File::exists($outputDirectory))
        {
            File::makeDirectory($outputDirectory);
        }

        $outputImage->setImageFormat(PSDParser::IMAGE_EXTENSION);
        $outputImage->writeImage($outputDirectory . $imageName . '.' . PSDParser::IMAGE_EXTENSION);

    }
}
