export class DiscordFileResponse extends Response {
  constructor(
    payload: unknown,
    file: {
      name: string
      data: Uint8Array
      contentType?: string
    },
  ) {
    const formData = new FormData()

    formData.append(
      'payload_json',
      JSON.stringify(payload),
    )

    const blob = new Blob(
      [file.data],
      {
        type:
          file.contentType ??
          'application/octet-stream',
      },
    )

    formData.append(
      'files[0]',
      blob,
      file.name,
    )

    super(formData, {
      status: 200,
    })
  }
}