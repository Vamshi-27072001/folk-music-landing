Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Media.SpeechSynthesis.SpeechSynthesizer,Windows.Media.SpeechSynthesis,ContentType=WindowsRuntime] | Out-Null
[Windows.Storage.Streams.DataReader,Windows.Storage.Streams,ContentType=WindowsRuntime] | Out-Null

function Await($WinRtTask, $ResultType) {
    $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
    }
    $asTaskGeneric = $asTask.MakeGenericMethod($ResultType)
    $task = $asTaskGeneric.Invoke($null, @($WinRtTask))
    $task.Wait() | Out-Null
    return $task.Result
}

$synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$voice = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices | Where-Object { $_.DisplayName -like "*Heera*" }
$synth.Voice = $voice
$synth.Options.SpeakingRate = 0.92

$lines = @{
    "vo1" = "Ever searched for a folk song... and got nothing back?"
    "vo2" = "Or the remix everyone's playing? Same story."
    "vo3" = "Meet Folk India."
    "vo4" = "Every folk track. Every remix. Every chart hit. Instantly."
    "vo5" = "Folk. DJ. Mainstream. Why carry three apps? Folk India. Download now."
}

$outDir = "f:\Websites\music landing paga\ad-bumper\audio"

foreach ($key in $lines.Keys) {
    $ssml = @"
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
  <prosody rate="0%" pitch="0%">$($lines[$key])</prosody>
</speak>
"@
    $stream = Await ($synth.SynthesizeSsmlToStreamAsync($ssml)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
    $inputStream = $stream.GetInputStreamAt(0)
    $dataReader = New-Object Windows.Storage.Streams.DataReader($inputStream)
    Await ($dataReader.LoadAsync($stream.Size)) ([UInt32]) | Out-Null
    $buffer = New-Object byte[] $stream.Size
    $dataReader.ReadBytes($buffer)
    $path = Join-Path $outDir "$key.wav"
    [System.IO.File]::WriteAllBytes($path, $buffer)
    Write-Output "Wrote $key.wav ($($buffer.Length) bytes)"
}
