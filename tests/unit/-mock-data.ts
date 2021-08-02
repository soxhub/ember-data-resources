import * as QUnit from 'qunit';

import { rest, setupWorker } from 'msw';

import type { SetupWorkerApi } from 'msw';

let worker: SetupWorkerApi;

QUnit.begin(async () => {
  worker = setupWorker();
  await worker.start();
});

QUnit.done(async () => {
  worker?.stop();
});

export function setupMockData(hooks: NestedHooks) {
  hooks.beforeEach(async function () {
    let data = [
      { id: '1', type: 'blogs', attributes: { name: `name:1` } },
      { id: '2', type: 'blogs', attributes: { name: `name:2` } },
      { id: '3', type: 'blogs', attributes: { name: `name:3` } },
    ];

    worker.use(
      rest.get('/blogs', (req, res, ctx) => {
        let id = req.url.searchParams.get('q[id]');

        if (id) {
          let record = data.find((datum) => datum.id === id);

          return res(ctx.json({ data: record }));
        }

        return res(ctx.json({ data }));
      }),

      rest.get('/blogs/:id', (req, res, ctx) => {
        let { id } = req.params;

        let record = data.find((datum) => datum.id === id);

        if (record) {
          return res(ctx.json({ data: record }));
        }

        return res(
          ctx.status(404),
          ctx.json({ errors: [{ status: '404', detail: 'Blog not found' }] })
        );
      })
    );
  });
}
