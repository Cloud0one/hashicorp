/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import authPage from 'vault/tests/pages/auth';
import modifyPassthroughResponse from 'vault/mirage/helpers/modify-passthrough-response';

const link = (label) => `[data-test-sidebar-nav-link="${label}"]`;
const panel = (label) => `[data-test-sidebar-nav-panel="${label}"]`;

module('Acceptance | sidebar navigation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    // set storage_type to raft to test link
    this.server.get('/sys/seal-status', (schema, req) => {
      return modifyPassthroughResponse(req, { storage_type: 'raft' });
    });
    this.server.get('/sys/storage/raft/configuration', () => this.server.create('configuration', 'withRaft'));
    this.server.get('/sys/internal/ui/resultant-acl', () =>
      this.server.create('configuration', { data: { root: true } })
    );
    return authPage.login();
  });

  test('it should link to correct routes at the cluster level', async function (assert) {
    assert.expect(10);

    assert.dom(panel('Cluster')).exists('Cluster nav panel renders');

    const subNavs = [
      { label: 'Access', route: 'access' },
      { label: 'Policies', route: 'policies/acl' },
      { label: 'Tools', route: 'tools/wrap' },
    ];

    for (const subNav of subNavs) {
      const { label, route } = subNav;
      await click(link(label));
      assert.strictEqual(currentURL(), `/vault/${route}`, `${label} route renders`);
      assert.dom(panel(label)).exists(`${label} nav panel renders`);
      await click(link('Back to main navigation'));
    }

    const links = [
      { label: 'Raft Storage', route: '/vault/storage/raft' },
      { label: 'Seal Vault', route: '/vault/settings/seal' },
      { label: 'Secrets engines', route: '/vault/secrets' },
    ];

    for (const l of links) {
      await click(link(l.label));
      assert.strictEqual(currentURL(), l.route, `${l.label} route renders`);
    }
  });

  test('it should link to correct routes at the access level', async function (assert) {
    assert.expect(7);

    await click(link('Access'));
    assert.dom(panel('Access')).exists('Access nav panel renders');

    const links = [
      { label: 'Multi-factor authentication', route: '/vault/access/mfa' },
      { label: 'OIDC', route: '/vault/access/oidc' },
      { label: 'Groups', route: '/vault/access/identity/groups' },
      { label: 'Entities', route: '/vault/access/identity/entities' },
      { label: 'Leases', route: '/vault/access/leases/list' },
      { label: 'Authentication methods', route: '/vault/access' },
    ];

    for (const l of links) {
      await click(link(l.label));
      assert.ok(currentURL().includes(l.route), `${l.label} route renders`);
    }
  });

  test('it should link to correct routes at the policies level', async function (assert) {
    assert.expect(4);

    await click(link('Policies'));
    assert.dom(panel('Policies')).exists('Access nav panel renders');

    const links = [
      { label: 'ACL Policies', route: '/vault/policies/acl' },
      { label: 'Role-Governing Policies', route: '/vault/policies/rgp' },
      { label: 'Endpoint Governing Policies', route: '/vault/policies/egp' },
    ];

    for (const l of links) {
      await click(link(l.label));
      assert.strictEqual(currentURL(), l.route, `${l.label} route renders`);
    }
  });

  test('it should link to correct routes at the tools level', async function (assert) {
    assert.expect(7);

    await click(link('Tools'));
    assert.dom(panel('Tools')).exists('Access nav panel renders');

    const links = [
      { label: 'Wrap', route: '/vault/tools/wrap' },
      { label: 'Lookup', route: '/vault/tools/lookup' },
      { label: 'Unwrap', route: '/vault/tools/unwrap' },
      { label: 'Rewrap', route: '/vault/tools/rewrap' },
      { label: 'Random', route: '/vault/tools/random' },
      { label: 'Hash', route: '/vault/tools/hash' },
    ];

    for (const l of links) {
      await click(link(l.label));
      assert.strictEqual(currentURL(), l.route, `${l.label} route renders`);
    }
  });
});
