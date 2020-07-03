class JsonpWrapper {
  jsonp = require('jsonp');

  fetch(url: string, opts: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // noinspection TypeScriptValidateTypes
      this.jsonp(url, opts, (err: Error, data: any) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }
}

export default function(url: string, opts: any) {
  const jsonp = new JsonpWrapper();
  return jsonp.fetch(url, opts);
}
