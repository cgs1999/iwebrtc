Ext.application({
    name: 'iWebRTC',

    launch: function () {
        Ext.Viewport.add(this.getMainView());
    },

    getMainView: function () {
        return {
            xtype: 'panel',
            fullscreen: true,
            layout: 'card',
            cardSwitchAnimation: {
                type: 'slide',
                cover: true
            },
            items: [{ xclass: 'iWebRTC.view.Login'}]
        };
    }
});