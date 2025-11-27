export class JsonResponse<T = unknown> extends Response {
  constructor(
    body: T,
    init: ResponseInit = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    },
  ) {
    const jsonBody = JSON.stringify(body)
    super(jsonBody, init)
  }
}
