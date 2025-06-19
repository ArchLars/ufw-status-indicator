/**
 * UFW Status Indicator for GNOME 48
 * Forked by ArchLars from illtellyoulater
 */

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk?version=4.0';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class UfwStatusIndicatorPreferences extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);
        this._logger = this.getLogger();
        this._logger.debug(`constructing ${this.metadata.name} preferences`);
    }

    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: 'UFW Status Indicator',
            icon_name: 'security-high-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Setup Instructions',
            description: 'Configure the UFW Status Indicator extension',
        });
        page.add(group);

        const instructionsRow = new Adw.ActionRow({
            title: 'Cron Job Setup Required',
            subtitle: 'This extension requires a root cron job to monitor UFW status',
        });
        group.add(instructionsRow);

        const expanderRow = new Adw.ExpanderRow({
            title: 'Click to see setup instructions',
        });
        group.add(expanderRow);

        const label = new Gtk.Label({
            label: 'To set up the UFW Status Indicator:\n\n' +
                   '1. Open a terminal\n' +
                   '2. Run: sudo crontab -e\n' +
                   '3. Add this line:\n' +
                   '   * * * * * LC_ALL=C LANGUAGE=C LANG=C ufw status | grep "Status:" > /var/log/ufw-status-indicator.ext.log\n' +
                   '4. Save and exit\n\n' +
                   'The indicator will start working within a minute.',
            margin_top: 12,
            margin_bottom: 12,
            margin_start: 12,
            margin_end: 12,
            wrap: true,
            xalign: 0,
        });
        expanderRow.add_row(label);

        const aboutGroup = new Adw.PreferencesGroup({
            title: 'About',
        });
        page.add(aboutGroup);

        const aboutRow = new Adw.ActionRow({
            title: 'UFW Status Indicator',
            subtitle: 'A visual indicator for the Uncomplicated Firewall',
        });
        aboutGroup.add(aboutRow);

        const githubRow = new Adw.ActionRow({
            title: 'GitHub Repository',
            subtitle: 'https://github.com/ArchLars/ufw-status-indicator',
            activatable: true,
        });
        githubRow.connect('activated', () => {
            Gtk.show_uri(window, 'https://github.com/ArchLars/ufw-status-indicator', 0);
        });
        aboutGroup.add(githubRow);
    }
}
