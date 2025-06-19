/**
 * UFW Status Indicator for GNOME 48
 * Forked by ArchLars from illtellyoulater
 */

import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const UfwStatusMenuItem = GObject.registerClass(
  class UfwStatusMenuItem extends PopupMenu.PopupBaseMenuItem {
    _init(iconName, toolTip) {
      super._init();
      this._icon = new St.Icon({ 
        x_expand: true, 
        icon_name: 'dialog-question-symbolic',
        style_class: 'system-status-icon',
        y_align: Clutter.ActorAlign.CENTER
      });
      this.add_child(this._icon);
      this._label = new St.Label({ 
        x_expand: true, 
        y_align: Clutter.ActorAlign.CENTER 
      });
      this.add_child(this._label);	
    }
  }
);
  
const UfwStatusIndicator = GObject.registerClass(
  class UfwStatusIndicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, "UFW Status Indicator");
      
      this._icon = new St.Icon({
        icon_name: 'security-low-symbolic',
        style_class: 'system-status-icon',
        y_align: Clutter.ActorAlign.CENTER,
        x_align: Clutter.ActorAlign.CENTER
      });
      this.add_child(this._icon);
      
      this._menuItem = new UfwStatusMenuItem('security-low-symbolic', 'futureToolTip');
      this.menu.addMenuItem(this._menuItem);
      this._file = Gio.File.new_for_path('/var/log/ufw-status-indicator.ext.log');
      this._monitor = this._file.monitor_file(Gio.FileMonitorFlags.NONE, null);
      this._changedFileSignalId = this._monitor.connect('changed', this._refresh.bind(this));
      this._refresh();
    }    
    
    _refresh() {
      let ufwStatus = this._getUfwStatusFromFile();
      if (ufwStatus === 'Status: active') {
        this._icon.icon_name = 'security-high-symbolic';
        this._icon.remove_style_class_name('ufw-status-icon-disabled');
        this._icon.remove_style_class_name('ufw-status-icon-unknown');
        this._icon.add_style_class_name('ufw-status-icon-enabled');
        
        this._menuItem._icon.icon_name = 'security-high-symbolic';
        this._menuItem._icon.remove_style_class_name('ufw-status-icon-disabled');
        this._menuItem._icon.remove_style_class_name('ufw-status-icon-unknown');
        this._menuItem._icon.add_style_class_name('ufw-status-icon-enabled');
        this._menuItem._label.set_text('UFW Firewall Enabled');
      } else if (ufwStatus === 'Status: inactive') {
        this._icon.icon_name = 'security-low-symbolic';
        this._icon.remove_style_class_name('ufw-status-icon-enabled');
        this._icon.remove_style_class_name('ufw-status-icon-unknown');
        this._icon.add_style_class_name('ufw-status-icon-disabled');
        
        this._menuItem._icon.icon_name = 'security-low-symbolic';
        this._menuItem._icon.remove_style_class_name('ufw-status-icon-enabled');
        this._menuItem._icon.remove_style_class_name('ufw-status-icon-unknown');
        this._menuItem._icon.add_style_class_name('ufw-status-icon-disabled');
        this._menuItem._label.set_text('UFW Firewall Disabled');
      } else {
        this._icon.icon_name = 'security-low-symbolic';
        this._icon.remove_style_class_name('ufw-status-icon-enabled');
        this._icon.remove_style_class_name('ufw-status-icon-disabled');
        this._icon.add_style_class_name('ufw-status-icon-unknown');
        
        this._menuItem._icon.icon_name = 'security-low-symbolic';
        this._menuItem._icon.remove_style_class_name('ufw-status-icon-enabled');
        this._menuItem._icon.remove_style_class_name('ufw-status-icon-disabled');
        this._menuItem._icon.add_style_class_name('ufw-status-icon-unknown');
        this._menuItem._label.set_text(
          '[ * Welcome to the UFW Indicator Setup! * ]\n'
          + '\n'
          + 'Before the indicator can work we need to setup a simple cron job  \n' 
          + 'which will run \'ufw status\' once per minute copying its output  \n' 
          + 'to "/var/log/ufw-status-indicator.ext.log" so that this extension \n'
          + 'will be able to parse it without directly requiring root access.  \n'
          + '\n'
          + 'To proceed with this task please open up a shell window and type: \n'
          + '\n'
          + 'sudo crontab -e \n'
          + '\n'
          + 'and then add this line to the crontab file making sure to save it:\n'
          + '\n'
          +	'* * * * * LC_ALL=C LANGUAGE=C LANG=C ufw status | grep "Status:" >  '
          + '/var/log/ufw-status-indicator.ext.log\n'
          + '\n'
          + 'Within a min the indicator will start working as expected, enjoy! \n'
          + '\n'
          + '--------------\n'
          + '\n'
          + 'Debug area (ignore this if you haven\'t set the cron job just yet)\n' 
          + 'Value returned when reading the UWF status or errors thrown if any\n'
          + ufwStatus
        );
      }
    }
      
    _getUfwStatusFromFile() {
      try {
        let [res, out] = GLib.file_get_contents('/var/log/ufw-status-indicator.ext.log');
        const decoder = new TextDecoder();
        return decoder.decode(out).trim();
      } catch (e) {
        console.error('Failed to read ufw-status-indicator.ext.log');
        console.error(e);
        return(e)
      }			
    }
      
    _onDestroy() {
      this._monitor.disconnect(this._changedFileSignalId);		
      super._onDestroy();
    }
  }
);

export default class UfwStatusIndicatorExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._logger = this.getLogger();
        this._logger.debug(`constructing ${this.metadata.name}`);
    }

    enable() {
        this._logger.debug(`${this.metadata.name}: enable() called`);
        this._indicator = new UfwStatusIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }
    
    disable() {
        this._logger.debug(`${this.metadata.name}: disable() called`);
        this._indicator?.destroy();
        this._indicator = null;
    }
}
