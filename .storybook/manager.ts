import { addons } from 'storybook/manager-api';
import { themes } from 'storybook/theming';

// Dark mode only, including Storybook's own sidebar and toolbar, so the tool
// matches the prototype it is showing. This themes the Storybook UI, not the
// stories -- stories are styled by build/css/tokens.css via preview.tsx.
addons.setConfig({ theme: themes.dark });
