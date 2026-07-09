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
Write-Output "Using voice: $($voice.DisplayName) $($voice.Language)"
$synth.Voice = $voice

$stream = Await ($synth.SynthesizeTextToStreamAsync("Folk India. Every song. One app.")) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])

$inputStream = $stream.GetInputStreamAt(0)
$dataReader = New-Object Windows.Storage.Streams.DataReader($inputStream)
Await ($dataReader.LoadAsync($stream.Size)) ([UInt32]) | Out-Null
$buffer = New-Object byte[] $stream.Size
$dataReader.ReadBytes($buffer)

[System.IO.File]::WriteAllBytes("f:\Websites\music landing paga\ad-bumper\audio\test_heera.wav", $buffer)
Write-Output "Wrote test_heera.wav ($($buffer.Length) bytes)"
